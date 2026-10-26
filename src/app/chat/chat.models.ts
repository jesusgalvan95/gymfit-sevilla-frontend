/**
 * Tipos que reflejan el contrato de POST /api/chat del backend Spring Boot.
 * Si el backend cambia sus DTO (ChatRequest, ChatResponse, Intencion), hay que actualizarlos aquí.
 */

/** Cuerpo de la petición. El backend exige un mensaje no vacío de 500 caracteres como máximo. */
export interface ChatRequest {
  mensaje: string;
}

/** Tipo de pregunta reconocida por el backend (enum Intencion). */
export type Intencion = 'HORARIO' | 'PRECIO' | 'HORARIO_Y_PRECIO' | 'DESCONOCIDA';

/** Respuesta del backend. */
export interface ChatResponse {
  respuesta: string;
  intencion: Intencion;
}

/** Límite de caracteres, igual que la validación @Size(max = 500) del backend. */
export const MAX_CARACTERES_MENSAJE = 500;

/** Un mensaje tal y como se muestra en la conversación. */
export interface MensajeChat {
  autor: 'cliente' | 'asistente';
  texto: string;
  /** true si el mensaje es un aviso de error y no una respuesta del gimnasio. */
  error?: boolean;
}
