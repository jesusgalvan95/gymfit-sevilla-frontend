import { afterRenderEffect, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MAX_CARACTERES_MENSAJE, MensajeChat } from './chat.models';
import { ChatService } from './chat.service';

/**
 * Ventana de chat con el asistente de GymFit Sevilla.
 *
 * El estado se guarda en signals: al cambiar un signal, Angular actualiza solo la parte de la
 * vista que lo usa. La conversación vive solo en memoria y se pierde al recargar la página.
 */
@Component({
  selector: 'app-chat',
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  private readonly chatService = inject(ChatService);

  protected readonly maxCaracteres = MAX_CARACTERES_MENSAJE;

  /** Preguntas frecuentes que se pueden enviar con un clic. */
  protected readonly sugerencias = [
    '¿Qué horario tenéis?',
    '¿Abrís el fin de semana?',
    '¿Cuánto cuesta la cuota?',
    '¿Hay matrícula?',
  ];

  protected readonly mensajes = signal<MensajeChat[]>([
    {
      autor: 'asistente',
      texto: '¡Hola! Soy el asistente de GymFit Sevilla. Pregúntame por nuestros horarios, tarifas o matrícula.',
    },
  ]);
  protected readonly borrador = signal('');
  protected readonly cargando = signal(false);

  /** El botón de enviar solo se activa con texto válido y sin otra petición en curso. */
  protected readonly puedeEnviar = computed(() => {
    const texto = this.borrador().trim();
    return !this.cargando() && texto.length > 0 && texto.length <= MAX_CARACTERES_MENSAJE;
  });

  private readonly lista = viewChild<ElementRef<HTMLElement>>('lista');

  constructor() {
    // Tras pintar un mensaje nuevo o el indicador de carga, baja hasta el final de la conversación.
    afterRenderEffect(() => {
      this.mensajes();
      this.cargando();
      const elemento = this.lista()?.nativeElement;
      if (elemento) {
        elemento.scrollTop = elemento.scrollHeight;
      }
    });
  }

  protected actualizarBorrador(evento: Event): void {
    this.borrador.set((evento.target as HTMLTextAreaElement).value);
  }

  /** Enter envía el mensaje; Mayús + Enter añade un salto de línea. */
  protected alPulsarTecla(evento: KeyboardEvent): void {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      this.enviar();
    }
  }

  protected enviarSugerencia(texto: string): void {
    this.borrador.set(texto);
    this.enviar();
  }

  protected enviar(): void {
    if (!this.puedeEnviar()) {
      return;
    }
    const texto = this.borrador().trim();
    this.anadir({ autor: 'cliente', texto });
    this.borrador.set('');
    this.cargando.set(true);

    this.chatService.enviar(texto).subscribe({
      next: (respuesta) => {
        this.anadir({ autor: 'asistente', texto: respuesta.respuesta });
        this.cargando.set(false);
      },
      error: (error: Error) => {
        this.anadir({ autor: 'asistente', texto: error.message, error: true });
        // Se recupera el texto para que el cliente pueda reenviarlo sin volver a escribirlo.
        if (this.borrador() === '') {
          this.borrador.set(texto);
        }
        this.cargando.set(false);
      },
    });
  }

  private anadir(mensaje: MensajeChat): void {
    this.mensajes.update((anteriores) => [...anteriores, mensaje]);
  }
}
