import { Component, inject, Input, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  ngOnInit() {}

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  // --- Tomar imagen / seleccionar imagen ---
  async takeImage() {

    let user = this.user();
    let path = `users/${user.uid}`;
    let imagePath = `${user.uid}/profile`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    const picture = await this.utilsSvc.takePicture('Imagen de perfil');

    // ---- Validar si el usuario canceló la cámara ----
    if (!picture || !picture.dataUrl) {
      loading.dismiss();
      return;
    }

    const dataUrl = picture.dataUrl;

    try {
      // Subir imagen
      user.image = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

      // Guardarla en Firestore
      await this.firebaseSvc.updateDocument(path, { image: user.image });

      // Guardar en local
      this.utilsSvc.saveInLocalStorage('user', user);

      // Mostrar toast de éxito
      this.utilsSvc.presentToast({
        message: 'Imagen actualizada exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });

    } catch (error: any) {

      console.log(error);
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });

    } finally {
      loading.dismiss();
    }
  }

}