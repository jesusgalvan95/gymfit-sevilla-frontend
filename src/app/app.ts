import { Component } from '@angular/core';
import { Chat } from './chat/chat';

/** Página principal de GymFit Sevilla: presentación del gimnasio y chat con el asistente. */
@Component({
  selector: 'app-root',
  imports: [Chat],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly anio = new Date().getFullYear();
}
