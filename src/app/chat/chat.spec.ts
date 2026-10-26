import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chat } from './chat';

describe('Chat', () => {
  let fixture: ComponentFixture<Chat>;
  let pagina: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chat],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Chat);
    pagina = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  function escribir(texto: string): void {
    const campo = pagina.querySelector('textarea')!;
    campo.value = texto;
    campo.dispatchEvent(new Event('input'));
  }

  function botonEnviar(): HTMLButtonElement {
    return pagina.querySelector('button[type="submit"]')!;
  }

  function burbujas(): string[] {
    return Array.from(pagina.querySelectorAll('.burbuja')).map((b) => b.textContent!.trim());
  }

  it('muestra el saludo inicial y el botón desactivado sin texto', () => {
    expect(burbujas()[0]).toContain('Soy el asistente de GymFit Sevilla');
    expect(botonEnviar().disabled).toBe(true);
  });

  it('envía el mensaje, muestra el indicador de carga y después la respuesta', async () => {
    escribir('¿Cuánto cuesta?');
    await fixture.whenStable();
    botonEnviar().click();
    await fixture.whenStable();

    expect(burbujas()).toContain('¿Cuánto cuesta?');
    expect(pagina.querySelector('.cargando')).not.toBeNull();
    expect(botonEnviar().disabled).toBe(true);

    http.expectOne('/api/chat').flush({ respuesta: 'La básica cuesta 29 €/mes.', intencion: 'PRECIO' });
    await fixture.whenStable();

    expect(burbujas()).toContain('La básica cuesta 29 €/mes.');
    expect(pagina.querySelector('.cargando')).toBeNull();
  });

  it('muestra un aviso de error y recupera el texto para reenviarlo', async () => {
    escribir('¿Abrís el sábado?');
    await fixture.whenStable();
    botonEnviar().click();
    await fixture.whenStable();

    http.expectOne('/api/chat').flush(null, { status: 0, statusText: 'Unknown Error' });
    await fixture.whenStable();

    expect(pagina.querySelector('.alert-danger')?.textContent).toContain('No se ha podido conectar');
    expect(pagina.querySelector('textarea')!.value).toBe('¿Abrís el sábado?');
    expect(pagina.querySelector('.cargando')).toBeNull();
  });

  it('las sugerencias envían la pregunta directamente', async () => {
    (pagina.querySelector('.card-footer button.btn-outline-secondary') as HTMLButtonElement).click();
    await fixture.whenStable();

    const peticion = http.expectOne('/api/chat');
    expect(peticion.request.body).toEqual({ mensaje: '¿Qué horario tenéis?' });
    peticion.flush({ respuesta: 'ok', intencion: 'HORARIO' });
  });

  it('no envía mensajes que solo tienen espacios', async () => {
    escribir('    ');
    await fixture.whenStable();

    expect(botonEnviar().disabled).toBe(true);
  });
});
