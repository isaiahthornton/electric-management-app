import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Thornton Energy Inc.');

  protected readonly intro = signal(`Thornton Energy Inc. is a leading provider of sustainable energy solutions, dedicated to delivering innovative and efficient energy systems for residential, commercial, and industrial applications. Our mission is to empower communities and businesses with reliable, clean, and cost-effective energy alternatives that contribute to a greener future.`);
}
