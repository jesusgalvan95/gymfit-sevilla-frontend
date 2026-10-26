import {
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MAX_CARACTERES_MENSAJE, MensajeChat } from './chat.models';
import { ChatService } from './chat.service';

/**
 * Segundos de espera tras los que se avisa de que la respuesta tarda más de lo normal.
 * Ocurre, por ejemplo, con la primera pregunta tras un rato sin uso: un modelo local tiene que cargarse en memoria.
 */
export const UMBRAL_RESPUESTA_LENTA_MS = 6_000;

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
  private readonly anfitrion = inject<ElementRef<HTMLElement>>(ElementRef);

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

  /** true mientras se espera la respuesta. Es público para que la página desactive las tarjetas durante la espera. */
  readonly cargando = signal(false);
  /** true si la respuesta tarda más de {@link UMBRAL_RESPUESTA_LENTA_MS}. */
  protected readonly lento = signal(false);

  /** El botón de enviar solo se activa con texto válido y sin otra petición en curso. */
  protected readonly puedeEnviar = computed(() => {
    const texto = this.borrador().trim();
    return !this.cargando() && texto.length > 0 && texto.length <= MAX_CARACTERES_MENSAJE;
  });

  private readonly lista = viewChild<ElementRef<HTMLElement>>('lista');
  private temporizadorLento: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // Tras pintar un mensaje nuevo o el indicador de carga, baja hasta el final de la conversación.
    afterRenderEffect(() => {
      this.mensajes();
      this.cargando();
      this.lento();
      const elemento = this.lista()?.nativeElement;
      if (elemento) {
        elemento.scrollTop = elemento.scrollHeight;
      }
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizadorLento));
  }

  /**
   * Envía una pregunta desde fuera del chat (las tarjetas de la página) y lleva la vista hasta la conversación.
   * No toca el texto que el cliente esté escribiendo. Si ya hay una pregunta en curso, no hace nada.
   */
  preguntar(pregunta: string): void {
    if (this.cargando()) {
      return;
    }
    // scrollIntoView puede no existir (por ejemplo, en los tests); "?." evita el error.
    this.anfitrion.nativeElement.scrollIntoView?.({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
    });
    this.enviarTexto(pregunta);
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
    if (!this.cargando()) {
      this.enviarTexto(texto);
    }
  }

  protected enviar(): void {
    if (!this.puedeEnviar()) {
      return;
    }
    const texto = this.borrador().trim();
    this.borrador.set('');
    this.enviarTexto(texto);
  }

  private enviarTexto(texto: string): void {
    this.anadir({ autor: 'cliente', texto });
    this.cargando.set(true);
    this.temporizadorLento = setTimeout(() => this.lento.set(true), UMBRAL_RESPUESTA_LENTA_MS);

    this.chatService.enviar(texto).subscribe({
      next: (respuesta) => {
        this.anadir({ autor: 'asistente', texto: respuesta.respuesta });
        this.terminarEspera();
      },
      error: (error: Error) => {
        this.anadir({ autor: 'asistente', texto: error.message, error: true });
        // Se recupera el texto para que el cliente pueda reenviarlo sin volver a escribirlo.
        if (this.borrador() === '') {
          this.borrador.set(texto);
        }
        this.terminarEspera();
      },
    });
  }

  private terminarEspera(): void {
    clearTimeout(this.temporizadorLento);
    this.lento.set(false);
    this.cargando.set(false);
  }

  private anadir(mensaje: MensajeChat): void {
    this.mensajes.update((anteriores) => [...anteriores, mensaje]);
  }
}
