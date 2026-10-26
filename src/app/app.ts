import { Component, viewChild } from '@angular/core';
import { Chat } from './chat/chat';

/** Preguntas que envía cada botón de tema al asistente. */
const PREGUNTAS = {
  horarios: '¿Qué horario tenéis?',
  tarifas: '¿Cuánto cuestan las tarifas?',
  matricula: '¿Hay que pagar matrícula?',
} as const;

/** Página principal de GymFit Sevilla: cabecera, sección principal con el chat y pie de página. */
@Component({
  selector: 'app-root',
  imports: [Chat],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly anio = new Date().getFullYear();

  /** Referencia al chat para que los botones de tema puedan enviarle preguntas y saber si está ocupado. */
  protected readonly chat = viewChild(Chat);

  /**
   * Botones bajo el título principal: cada uno envía su pregunta al chat.
   * No contienen horarios ni precios: los datos reales viven solo en el backend (gymfit.info.* en
   * application.properties), así que hay una única fuente de verdad.
   */
  protected readonly temas = [
    { nombre: 'Horarios', pregunta: PREGUNTAS.horarios },
    { nombre: 'Tarifas', pregunta: PREGUNTAS.tarifas },
    { nombre: 'Matrícula', pregunta: PREGUNTAS.matricula },
  ];

  protected preguntar(pregunta: string): void {
    this.chat()?.preguntar(pregunta);
  }
}
