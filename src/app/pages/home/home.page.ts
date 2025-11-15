import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  babyName = 'Aly';
  private readonly router = inject(Router);

  goToSueno() {
    this.router.navigate(['/sueno']);
  }

  goToVacunas() {
    this.router.navigate(['/vacunas']);
  }

  goToControles() {
    this.router.navigate(['/controles']);
  }

  goToPeso() {
    this.router.navigate(['/alimentacion']);
  }
}
