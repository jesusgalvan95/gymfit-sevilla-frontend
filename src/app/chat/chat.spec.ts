import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Chat, UMBRAL_RESPUESTA_LENTA_MS } from './chat';

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

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  function escribir(texto: string): void {
    const campo = pagina.querySelector('textarea')!;
    campo.value = texto;
    campo.dispatchEvent(new Event('input'));
  }

  function botonEnviar(): HTMLButtonElement {
    return pagina.querySelector('button[type="submit"]')!;
  }

  function burbujas(): string[] {
    return Array.from(pagina.querySelectorAll('.burbuja')).map((b) => b.textContent!.replace(/\s+/g, ' ').trim());
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

    expect(burbujas()).toContain('Tú: ¿Cuánto cuesta?');
    expect(pagina.querySelector('.cargando')).not.toBeNull();
    expect(pagina.querySelector('.cargando')!.textContent).toContain('escribiendo');
    expect(pagina.querySelector('[role="log"]')!.getAttribute('aria-busy')).toBe('true');
    expect(botonEnviar().disabled).toBe(true);

    http.expectOne('/api/chat').flush({ respuesta: 'La básica cuesta 29 €/mes.', intencion: 'PRECIO' });
    await fixture.whenStable();

    expect(burbujas()).toContain('Asistente: La básica cuesta 29 €/mes.');
    expect(pagina.querySelector('.cargando')).toBeNull();
    expect(pagina.querySelector('[role="log"]')!.getAttribute('aria-busy')).toBe('false');
  });

  it('avisa de que la respuesta tarda cuando se supera el umbral', async () => {
    vi.useFakeTimers();
    escribir('hola');
    fixture.detectChanges();
    botonEnviar().click();
    fixture.detectChanges();
    expect(pagina.querySelector('.cargando')!.textContent).toContain('escribiendo');

    vi.advanceTimersByTime(UMBRAL_RESPUESTA_LENTA_MS + 100);
    fixture.detectChanges();
    expect(pagina.querySelector('.cargando')!.textContent).toContain('Puede tardar unos segundos más');

    // Al llegar la respuesta el aviso desaparece y no queda ningún temporizador pendiente.
    http.expectOne('/api/chat').flush({ respuesta: 'ok', intencion: 'DESCONOCIDA' });
    fixture.detectChanges();
    expect(pagina.querySelector('.cargando')).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('muestra un aviso de error y recupera el texto para reenviarlo', async () => {
    escribir('¿Abrís el sábado?');
    await fixture.whenStable();
    botonEnviar().click();
    await fixture.whenStable();

    http.expectOne('/api/chat').flush(null, { status: 0, statusText: 'Unknown Error' });
    await fixture.whenStable();

    expect(pagina.querySelector('.burbuja-error')?.textContent).toContain('No se ha podido conectar');
    expect(pagina.querySelector('textarea')!.value).toBe('¿Abrís el sábado?');
    expect(pagina.querySelector('.cargando')).toBeNull();
  });

  it('las sugerencias envían la pregunta directamente', async () => {
    (pagina.querySelector('.gf-sugerencia') as HTMLButtonElement).click();
    await fixture.whenStable();

    const peticion = http.expectOne('/api/chat');
    expect(peticion.request.body).toEqual({ mensaje: '¿Qué horario tenéis?' });
    peticion.flush({ respuesta: 'ok', intencion: 'HORARIO' });
  });

  it('las sugerencias se desactivan mientras se espera la respuesta', async () => {
    (pagina.querySelector('.gf-sugerencia') as HTMLButtonElement).click();
    await fixture.whenStable();

    const sugerencias = Array.from(pagina.querySelectorAll<HTMLButtonElement>('.gf-sugerencia'));
    expect(sugerencias.every((boton) => boton.disabled)).toBe(true);

    http.expectOne('/api/chat').flush({ respuesta: 'ok', intencion: 'HORARIO' });
  });

  it('preguntar() desde fuera envía la pregunta sin borrar lo que el cliente estaba escribiendo', async () => {
    escribir('Mi pregunta a medias');
    await fixture.whenStable();

    fixture.componentInstance.preguntar('¿Hay que pagar matrícula?');
    await fixture.whenStable();

    const peticion = http.expectOne('/api/chat');
    expect(peticion.request.body).toEqual({ mensaje: '¿Hay que pagar matrícula?' });
    expect(pagina.querySelector('textarea')!.value).toBe('Mi pregunta a medias');
    peticion.flush({ respuesta: 'ok', intencion: 'PRECIO' });
  });

  it('preguntar() no envía nada si ya hay una pregunta en curso', async () => {
    fixture.componentInstance.preguntar('primera');
    fixture.componentInstance.preguntar('segunda');
    await fixture.whenStable();

    const peticiones = http.match('/api/chat');
    expect(peticiones.length).toBe(1);
    expect(peticiones[0].request.body).toEqual({ mensaje: 'primera' });
    peticiones[0].flush({ respuesta: 'ok', intencion: 'DESCONOCIDA' });
  });

  it('no envía mensajes que solo tienen espacios', async () => {
    escribir('    ');
    await fixture.whenStable();

    expect(botonEnviar().disabled).toBe(true);
  });

  it('el campo de texto tiene etiqueta accesible y el chat anuncia los mensajes', () => {
    const campo = pagina.querySelector('textarea')!;
    expect(pagina.querySelector(`label[for="${campo.id}"]`)).not.toBeNull();

    const registro = pagina.querySelector('[role="log"]')!;
    expect(registro.getAttribute('aria-live')).toBe('polite');
    expect(registro.getAttribute('aria-label')).toBe('Conversación');
  });
});
