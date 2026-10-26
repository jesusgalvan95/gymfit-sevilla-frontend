import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let pagina: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    pagina = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  function tarjetasConBoton(): HTMLButtonElement[] {
    return Array.from(pagina.querySelectorAll<HTMLButtonElement>('#informacion article button'));
  }

  it('tiene la estructura de una landing: cabecera, contenido principal y pie', () => {
    expect(pagina.querySelector('header')).not.toBeNull();
    expect(pagina.querySelector('main#contenido')).not.toBeNull();
    expect(pagina.querySelector('footer')).not.toBeNull();
    expect(pagina.querySelector('h1')?.textContent).toContain('Sevilla');
  });

  it('el chat es el protagonista: está en la sección principal, junto al título', () => {
    const principal = pagina.querySelector('#inicio')!;
    expect(principal.querySelector('h1')).not.toBeNull();
    expect(principal.querySelector('app-chat')).not.toBeNull();
  });

  it('es accesible: enlace para saltar al contenido, títulos ordenados y SVG decorativos ocultos', () => {
    const salto = pagina.querySelector<HTMLAnchorElement>('a.gf-skip')!;
    expect(salto.getAttribute('href')).toBe('#contenido');

    expect(pagina.querySelectorAll('h1').length).toBe(1);
    expect(pagina.querySelectorAll('h2').length).toBeGreaterThanOrEqual(2);
    expect(pagina.querySelectorAll('h3').length).toBe(4);

    const svgSinOcultar = Array.from(pagina.querySelectorAll('svg')).filter(
      (svg) => svg.getAttribute('aria-hidden') !== 'true' && !svg.closest('[aria-hidden="true"]'),
    );
    expect(svgSinOcultar.length).toBe(0);
  });

  it('los enlaces de la cabecera apuntan a secciones que existen', () => {
    const destinos = Array.from(pagina.querySelectorAll<HTMLAnchorElement>('header a[href^="#"]')).map((a) =>
      a.getAttribute('href')!,
    );

    expect(destinos.length).toBeGreaterThan(0);
    for (const destino of destinos) {
      expect(pagina.querySelector(destino), `no existe ${destino}`).not.toBeNull();
    }
  });

  it('muestra tres tarjetas que preguntan al asistente y una informativa', () => {
    expect(pagina.querySelectorAll('#informacion article').length).toBe(4);
    expect(tarjetasConBoton().length).toBe(3);
  });

  it('al pulsar una tarjeta se envía su pregunta a POST /api/chat y se muestra en el chat', async () => {
    tarjetasConBoton()[1].click(); // Tarifas
    await fixture.whenStable();

    const peticion = http.expectOne('/api/chat');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({ mensaje: '¿Cuánto cuestan las tarifas?' });
    expect(pagina.querySelector('app-chat')!.textContent).toContain('¿Cuánto cuestan las tarifas?');

    peticion.flush({ respuesta: 'Respuesta de prueba', intencion: 'PRECIO' });
    await fixture.whenStable();
    expect(pagina.querySelector('app-chat')!.textContent).toContain('Respuesta de prueba');
  });

  it('las tarjetas se desactivan mientras el chat espera una respuesta', async () => {
    tarjetasConBoton()[0].click();
    await fixture.whenStable();

    expect(tarjetasConBoton().every((boton) => boton.disabled)).toBe(true);

    http.expectOne('/api/chat').flush({ respuesta: 'ok', intencion: 'HORARIO' });
    await fixture.whenStable();
    expect(tarjetasConBoton().some((boton) => boton.disabled)).toBe(false);
  });

  /**
   * Los horarios y precios reales viven solo en el backend. Si alguien los copiara a la página, podrían quedar
   * desactualizados o inventarse: este test falla si aparece cualquier cifra o importe en el contenido estático.
   */
  it('no contiene horarios, precios ni datos de contacto escritos a mano', () => {
    const fuera = pagina.cloneNode(true) as HTMLElement;
    fuera.querySelector('app-chat')?.remove(); // El chat muestra datos del backend; la página no.
    fuera.querySelector('.gf-copyright')?.remove(); // Aquí solo va el año del © (se calcula).
    const texto = fuera.textContent ?? '';

    expect(texto).not.toMatch(/\d/);
    expect(texto).not.toMatch(/[€$]/);
    expect(texto).not.toMatch(/@|tel[eé]fono|whatsapp/i);
  });
});
