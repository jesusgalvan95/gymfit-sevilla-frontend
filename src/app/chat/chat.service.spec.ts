import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TimeoutError } from 'rxjs';
import { ChatService, mensajeDeError } from './chat.service';

/**
 * HttpTestingController sustituye al servidor real: ninguna petición sale del test,
 * así que no hace falta el backend ni se consume nada.
 */
describe('ChatService', () => {
  let servicio: ChatService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(ChatService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía POST /api/chat con el mensaje y devuelve la respuesta', () => {
    let respuesta: unknown;
    servicio.enviar('¿Qué horario tenéis?').subscribe((r) => (respuesta = r));

    const peticion = http.expectOne('/api/chat');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({ mensaje: '¿Qué horario tenéis?' });
    peticion.flush({ respuesta: 'Abrimos de 7:00 a 22:00.', intencion: 'HORARIO' });

    expect(respuesta).toEqual({ respuesta: 'Abrimos de 7:00 a 22:00.', intencion: 'HORARIO' });
  });

  it('convierte un error HTTP en un mensaje comprensible', () => {
    let error: Error | undefined;
    servicio.enviar('hola').subscribe({ error: (e: Error) => (error = e) });

    http.expectOne('/api/chat').flush(null, { status: 500, statusText: 'Internal Server Error' });

    expect(error?.message).toContain('error inesperado');
  });

  it('distingue servidor caído, petición inválida y timeout', () => {
    expect(mensajeDeError(new HttpErrorResponse({ status: 0 }))).toContain('No se ha podido conectar');
    expect(mensajeDeError(new HttpErrorResponse({ status: 400 }))).toContain('500 caracteres');
    expect(mensajeDeError(new TimeoutError())).toContain('tardando demasiado');
  });
});
