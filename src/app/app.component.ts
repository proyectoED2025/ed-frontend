import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/authService';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Proyecto_web';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.hydrateFromStorage();
  }
}
