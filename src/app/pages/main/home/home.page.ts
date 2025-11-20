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
  loading: boolean = false;

  ngOnInit() {
  }

  user(): User{
    return this.utilsSvc.getFromLocalStorage('user');
  }
  ionViewWillEnter() {
    this.getImage();
  }

  doRefresh(event) {

    setTimeout(() => {
      this.getImage();
      console.log('Async operation has ended');
      event.target.complete();
    }, 1000);
  }

  // ----- Obtener imagen ----
  getImage() {
    let path = `users/${this.user().uid}/image`

    this.loading = true;

    let sub = this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        console.log(res);
        this.image = res;
        
        this.loading = false;

        sub.unsubscribe();
      }
    })
  }

  // ------ Agregar o actualizar imagen -----
  async addUpdateImage(image?: Imagen) {
    const result = await this.utilsSvc.presentModal({
      component: AddUpdateImageComponent,
      cssClass: 'add-update-modal',
      componentProps: { image: this.image[0] ?? null }
    });

    if (result?.success) {
    this.getImage();
  }
  }

  async deleteImage(image: Imagen) {

      let path = `users/${this.user().uid}/image/${image.id}`

      const loading = await this.utilsSvc.loading();
      await loading.present();

      let imagePath = await this.firebaseSvc.getFilePath(image.image);
      await this.firebaseSvc.deleteFile(imagePath);

      this.firebaseSvc.deleteDocument(path).then(async res => {

        this.image = this.image.filter(p => p.id !== image.id);

        this.utilsSvc.presentToast({
          message: 'Perfil eliminado exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        })

      }).catch(error => {
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })

      }).finally(() => {
        loading.dismiss();
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
