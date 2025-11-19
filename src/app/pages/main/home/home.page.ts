import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Imagen } from 'src/app/models/image.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateImageComponent } from 'src/app/shared/components/add-update-image/add-update-image.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  image: Imagen[] = [];

  ngOnInit() {
  }

  user(): User{
    return this.utilsSvc.getFromLocalStorage('user');
  }
  ionViewWillEnter() {
    this.getImage();
  }

  // ----- Obtener imagen ----
  getImage() {
    let path = `users/${this.user().uid}/image`

    let sub = this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        console.log(res);
        this.image = res;
        sub.unsubscribe();
      }
    })
  }

  // ------ Agregar o actualizar imagen -----
  addUpdateImage() {
    this.utilsSvc.presentModal({
      component: AddUpdateImageComponent,
      cssClass: 'add-update-modal'
    })
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
