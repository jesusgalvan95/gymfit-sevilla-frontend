import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

  function botonesDelHero(): HTMLButtonElement[] {
    return Array.from(pagina.querySelectorAll<HTMLButtonElement>('#inicio ul.gf-etiquetas button'));
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

  it('la foto de la sección principal es decorativa y se carga con varios tamaños', () => {
    const foto = pagina.querySelector<HTMLImageElement>('#inicio img.gf-hero-foto')!;

    expect(foto.getAttribute('alt')).toBe(''); // alt vacío: los lectores de pantalla la ignoran
    expect(foto.getAttribute('srcset')!.split(',').length).toBe(3);
    expect(foto.getAttribute('fetchpriority')).toBe('high'); // es lo primero que ve el visitante
    expect(foto.getAttribute('width')).toBeTruthy(); // reserva el hueco y evita saltos de diseño
    expect(foto.getAttribute('height')).toBeTruthy();
  });

  it('la foto de fondo es la única imagen de la página: no hay tarjetas ni galería de fotos', () => {
    expect(pagina.querySelectorAll('img').length).toBe(1);
    expect(pagina.querySelector('figure')).toBeNull();
    expect(pagina.querySelector('.gf-galeria')).toBeNull();
  });

  it('la foto se presenta como imagen de stock y los créditos enlazan con la ficha original de Pexels', () => {
    const creditos = pagina.querySelector('.gf-creditos')!;
    expect(creditos.textContent).toContain('imagen de stock');
    expect(creditos.textContent).toContain('no muestra las instalaciones ni a las personas de GymFit Sevilla');

    const enlaces = Array.from(creditos.querySelectorAll<HTMLAnchorElement>('a'));
    expect(enlaces.length).toBe(2); // Pexels + el autor
    for (const enlace of enlaces) {
      expect(enlace.href).toContain('https://www.pexels.com/');
      expect(enlace.getAttribute('target')).toBe('_blank');
      expect(enlace.getAttribute('rel')).toContain('noopener');
    }
  });

  describe('botones Horarios, Tarifas y Matrícula bajo el título', () => {
    it('son botones reales (no texto) con un nombre accesible que incluye lo que se ve', () => {
      const botones = botonesDelHero();

      expect(botones.map((boton) => boton.textContent!.replace(/\s+/g, ' ').trim())).toEqual([
        'Horarios: preguntar al asistente',
        'Tarifas: preguntar al asistente',
        'Matrícula: preguntar al asistente',
      ]);
      expect(botones.every((boton) => boton.type === 'button')).toBe(true);
    });

    it('cada botón envía su pregunta a POST /api/chat una sola vez y la muestra en el chat', async () => {
      const preguntas = ['¿Qué horario tenéis?', '¿Cuánto cuestan las tarifas?', '¿Hay que pagar matrícula?'];

      for (const [indice, pregunta] of preguntas.entries()) {
        botonesDelHero()[indice].click();
        await fixture.whenStable();

        const peticion = http.expectOne('/api/chat');
        expect(peticion.request.method).toBe('POST');
        expect(peticion.request.body).toEqual({ mensaje: pregunta });
        expect(pagina.querySelector('app-chat')!.textContent).toContain(pregunta);

        peticion.flush({ respuesta: 'Respuesta de prueba', intencion: 'HORARIO' });
        await fixture.whenStable();
      }
    });

    it('no duplican peticiones: pulsar varias veces seguidas, o otro botón, envía solo una', async () => {
      const [horarios, tarifas] = botonesDelHero();

      horarios.click();
      horarios.click(); // doble clic inmediato, antes de que Angular repinte
      tarifas.click(); // otro botón mientras la primera pregunta sigue en curso
      tarjetasConBoton()[2].click(); // y una tarjeta
      await fixture.whenStable();

      const peticiones = http.match('/api/chat');
      expect(peticiones.length).toBe(1);
      expect(peticiones[0].request.body).toEqual({ mensaje: '¿Qué horario tenéis?' });
      peticiones[0].flush({ respuesta: 'ok', intencion: 'HORARIO' });
    });

    it('se desactivan mientras se espera la respuesta y se reactivan después', async () => {
      botonesDelHero()[0].click();
      await fixture.whenStable();
      expect(botonesDelHero().every((boton) => boton.disabled)).toBe(true);

      http.expectOne('/api/chat').flush({ respuesta: 'ok', intencion: 'HORARIO' });
      await fixture.whenStable();
      expect(botonesDelHero().some((boton) => boton.disabled)).toBe(false);
    });

    it('se reactivan también si la petición falla, y se puede volver a preguntar', async () => {
      botonesDelHero()[0].click();
      await fixture.whenStable();
      http.expectOne('/api/chat').flush(null, { status: 0, statusText: 'Unknown Error' });
      await fixture.whenStable();

      expect(pagina.querySelector('app-chat')!.textContent).toContain('No se ha podido conectar');
      expect(botonesDelHero().some((boton) => boton.disabled)).toBe(false);

      botonesDelHero()[0].click();
      await fixture.whenStable();
      http.expectOne('/api/chat').flush({ respuesta: 'ok', intencion: 'HORARIO' });
    });

    it('llevan hasta el chat si no está entero a la vista (por ejemplo, en móvil)', async () => {
      const chat = pagina.querySelector<HTMLElement>('app-chat')!;
      chat.scrollIntoView = vi.fn();
      // En jsdom todas las cajas miden 0, es decir, el chat queda fuera del área visible bajo la cabecera.

      botonesDelHero()[1].click();
      await fixture.whenStable();

      expect(chat.scrollIntoView).toHaveBeenCalledTimes(1);
      expect(chat.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'start' }));
      http.expectOne('/api/chat').flush({ respuesta: 'ok', intencion: 'PRECIO' });
    });

    it('no mueven la página si el chat ya está entero a la vista (por ejemplo, en escritorio)', async () => {
      const chat = pagina.querySelector<HTMLElement>('app-chat')!;
      chat.scrollIntoView = vi.fn();
      chat.getBoundingClientRect = () => ({ top: 150, bottom: 600 }) as DOMRect;

      botonesDelHero()[1].click();
      await fixture.whenStable();

      expect(chat.scrollIntoView).not.toHaveBeenCalled();
      http.expectOne('/api/chat').flush({ respuesta: 'ok', intencion: 'PRECIO' });
    });
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
