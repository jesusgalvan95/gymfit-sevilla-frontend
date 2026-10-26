import { Component, viewChild } from '@angular/core';
import { Chat } from './chat/chat';

/** Icono que se dibuja en cada tarjeta (SVG propio, definido en app.html). */
type IconoTarjeta = 'reloj' | 'tarifa' | 'matricula' | 'recepcion';

/**
 * Tarjeta de la sección "Qué puedes consultar".
 *
 * Las tarjetas NO contienen horarios ni precios: solo envían una pregunta al asistente. Los datos reales viven
 * únicamente en el backend (gymfit.info.* en application.properties), así que hay una sola fuente de verdad y
 * la página nunca muestra un dato desactualizado.
 */
interface TarjetaInfo {
  icono: IconoTarjeta;
  titulo: string;
  descripcion: string;
  /** Pregunta que se envía al chat al pulsar el botón. Si no hay, la tarjeta es solo informativa. */
  pregunta?: string;
  /** Texto del botón; se lee entero por los lectores de pantalla, así que debe entenderse por sí solo. */
  accion?: string;
}

/** Página principal de GymFit Sevilla: cabecera, chat con el asistente, información y pie de página. */
@Component({
  selector: 'app-root',
  imports: [Chat],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly anio = new Date().getFullYear();

  /** Referencia al chat para que las tarjetas puedan enviarle preguntas y saber si está ocupado. */
  protected readonly chat = viewChild(Chat);

  protected readonly tarjetas: TarjetaInfo[] = [
    {
      icono: 'reloj',
      titulo: 'Horarios',
      descripcion: 'Consulta cuándo abrimos de lunes a viernes y durante el fin de semana.',
      pregunta: '¿Qué horario tenéis?',
      accion: 'Preguntar por los horarios',
    },
    {
      icono: 'tarifa',
      titulo: 'Tarifas',
      descripcion: 'Conoce las tarifas básica y premium y lo que cuesta cada una al mes.',
      pregunta: '¿Cuánto cuestan las tarifas?',
      accion: 'Preguntar por las tarifas',
    },
    {
      icono: 'matricula',
      titulo: 'Matrícula',
      descripcion: 'Averigua si hay que pagar matrícula al darte de alta.',
      pregunta: '¿Hay que pagar matrícula?',
      accion: 'Preguntar por la matrícula',
    },
    {
      icono: 'recepcion',
      titulo: 'Otras consultas',
      descripcion:
        'Si el asistente no tiene la información que buscas, te lo dirá. Para cualquier otra consulta, pregunta en recepción.',
    },
  ];

  protected preguntar(pregunta: string): void {
    this.chat()?.preguntar(pregunta);
  }
}
