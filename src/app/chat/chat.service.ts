import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError, timeout, TimeoutError } from 'rxjs';
import { ChatRequest, ChatResponse } from './chat.models';

/**
 * Tiempo máximo de espera. El backend puede tardar hasta unos 40 s en el peor caso
 * (timeout del LLM + 1 reintento) antes de responder con reglas, así que se deja algo de margen.
 */
export const TIMEOUT_CHAT_MS = 45_000;

/**
 * Comunica la página con el chat del backend.
 *
 * La URL es relativa ("/api/chat"): en desarrollo, el proxy de `ng serve` (proxy.conf.json) la
 * redirige a http://localhost:8080. El frontend nunca habla con Anthropic ni conoce ninguna clave:
 * eso lo hace solo el backend.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);

  enviar(mensaje: string): Observable<ChatResponse> {
    const peticion: ChatRequest = { mensaje };
    return this.http.post<ChatResponse>('/api/chat', peticion).pipe(
      timeout(TIMEOUT_CHAT_MS),
      catchError((error: unknown) => throwError(() => new Error(mensajeDeError(error)))),
    );
  }
}

/** Traduce cualquier fallo técnico a un texto comprensible para el cliente del gimnasio. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof TimeoutError) {
    return 'El asistente está tardando demasiado en responder. Inténtalo de nuevo en unos segundos.';
  }
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se ha podido conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
    }
    if (error.status === 400) {
      return 'No hemos podido procesar el mensaje. Revisa que no esté vacío y que no supere los 500 caracteres.';
    }
  }
  return 'Ha ocurrido un error inesperado. Inténtalo de nuevo o pregunta en recepción.';
}
