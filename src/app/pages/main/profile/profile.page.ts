import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
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
  router = inject(Router);

  // Arreglo de bebés para el grid
  babies: any[] = [];

  ngOnInit() {
    this.loadBabies();
  }

  // Usuario desde localStorage
  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  // Cargar bebés (ajusta según tu modelo / Firebase)
  loadBabies() {
    const user = this.user();
    if (user && (user as any).babies) {
      this.babies = (user as any).babies;
    } else {
      this.babies = [];
    }

    // Si luego los lees desde Firebase, puedes reemplazar por:
    // this.firebaseSvc.getCollectionData(`users/${user.uid}/babies`).then(...);
  }

  // --- FOTO PERFIL TUTOR ---
  async takeImage() {
    const user = this.user();
    if (!user) { return; }

    const path = `users/${user.uid}`;
    const imagePath = `${user.uid}/profile`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const picture = await this.utilsSvc.takePicture('Imagen de perfil');

      // Si cancela cámara / galería
      if (!picture || !picture.dataUrl) {
        await loading.dismiss();
        return;
      }

      const imageUrl = await this.firebaseSvc.uploadImage(path, imagePath, picture.dataUrl);

      await this.firebaseSvc.updateDocument(path, { image: imageUrl });

      // Actualizar user en localStorage
      (user as any).image = imageUrl;
      this.utilsSvc.setInLocalStorage('user', user);

      this.utilsSvc.presentToast({
        message: 'Foto de perfil actualizada',
        color: 'success',
        duration: 1500,
        position: 'middle',
      });
    } catch (error) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: 'Error al actualizar la imagen',
        color: 'danger',
        duration: 1500,
        position: 'middle',
      });
    } finally {
      loading.dismiss();
    }
  }

  // --- FOTO BEBÉ ---
  async changeBabyPhoto(baby: any) {
    const user = this.user();
    if (!user) { return; }

    const path = `users/${user.uid}/babies`;
    const imagePath = `${user.uid}/babies/${baby.id || Date.now()}`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const picture = await this.utilsSvc.takePicture('Foto del bebé');

      if (!picture || !picture.dataUrl) {
        await loading.dismiss();
        return;
      }

      const imageUrl = await this.firebaseSvc.uploadImage(path, imagePath, picture.dataUrl);

      // Actualizar en Firebase (ajusta la ruta del documento según tu modelo)
      if (baby.id) {
        await this.firebaseSvc.updateDocument(`${path}/${baby.id}`, { photo: imageUrl });
      }

      // Reflejar en la UI
      baby.photo = imageUrl;

      this.utilsSvc.presentToast({
        message: 'Foto del bebé actualizada',
        color: 'success',
        duration: 1500,
        position: 'middle',
      });
    } catch (error) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: 'Error al actualizar foto del bebé',
        color: 'danger',
        duration: 1500,
        position: 'middle',
      });
    } finally {
      loading.dismiss();
    }
  }

  // --- NAVEGACIÓN / ACCIONES ---

  editTutorProfile() {
    // TODO: Ajusta la ruta a tu página de edición de perfil
    this.router.navigate(['/edit-profile']);
  }

  addBaby() {
    // TODO: Ajusta la ruta a tu formulario para crear bebé
    this.router.navigate(['/add-baby']);
  }

  editBaby(baby: any) {
    // TODO: Ajusta la ruta y parámetro según tu app
    this.router.navigate(['/edit-baby', baby.id]);
  }

  goToTerms() {
    // TODO: Ruta a términos y condiciones
    this.router.navigate(['/terms']);
  }

  goToHelpDesk() {
    // TODO: Ruta a mesa de ayuda / soporte
    this.router.navigate(['/help-desk']);
  }
}
