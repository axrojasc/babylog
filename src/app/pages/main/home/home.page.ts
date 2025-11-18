import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  babyName = 'Aly';

  ngOnInit() {
  }

  private readonly router = inject(Router);

  goToSueno() {
    this.router.navigate(['/main/sueno']);
  }

  goToVacunas() {
    this.router.navigate(['/main/vacunas']);
  }

  goToControles() {
    this.router.navigate(['/main/controles']);
  }

  goToPeso() {
    this.router.navigate(['/main/alimentacion']);
  }
}
