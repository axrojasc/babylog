import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  babyName = 'Aly';
  
  constructor(private router: Router) {}

  goToVacunas() {
    this.router.navigate(['/vacunas']);
  }

  goToControles() {
    this.router.navigate(['/controles']);
  }
}
