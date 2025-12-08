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

  // Lista de bebés cargados desde Firebase
  babies: any[] = [];

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadBabies();
  }

  // Usuario desde localStorage
  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  // Cargar bebés desde Firebase en tiempo real
  async loadBabies() {
    const user = this.user();
    if (!user) return;

    const path = `users/${user.uid}/babies`;

    this.firebaseSvc.getCollectionData(path).subscribe({
      next: (babies: any[]) => {
        this.babies = babies.map(b => ({
          id: b.id,
          ...b
        }));
        console.log('Bebés cargados:', this.babies);
      },
      error: (err) => {
        console.error('Error cargando bebés:', err);
        this.babies = [];
      }
    });
  }

  // --- MARCAR BEBÉ PRINCIPAL (FAVORITO) ---
async setFavorite(baby: any) {
  const user = this.user();
  if (!user) return;

  const path = `users/${user.uid}/babies`;

  const loading = await this.utilsSvc.loading();
  await loading.present();

  try {
    // Poner isFavorite = true solo al seleccionado y false al resto
    const updates = this.babies.map(b =>
      this.firebaseSvc.updateDocument(`${path}/${b.id}`, {
        isFavorite: b.id === baby.id
      })
    );

    await Promise.all(updates);

    // 🟢 Guardar bebé activo en localStorage para que otras vistas lo usen
    this.utilsSvc.setInLocalStorage('currentBaby', {
      id: baby.id,
      firstName: baby.firstName,
      lastName: baby.lastName,
      photo: baby.photo || null,
    });

    this.utilsSvc.presentToast({
      message: 'Bebé principal actualizado',
      color: 'success',
      duration: 1500,
      position: 'middle',
    });

  } catch (error) {
    console.error(error);
    this.utilsSvc.presentToast({
      message: 'Error al actualizar bebé principal',
      color: 'danger',
      duration: 2000,
      position: 'middle',
    });
  } finally {
    loading.dismiss();
  }
}

  // --- FOTO PERFIL TUTOR ---
  async takeImage() {
    const user = this.user();
    if (!user) return;

    const path = `users/${user.uid}`;
    const imagePath = `${user.uid}/profile`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const picture = await this.utilsSvc.takePicture('Imagen de perfil');

      if (!picture || !picture.dataUrl) {
        await loading.dismiss();
        return;
      }

      const imageUrl = await this.firebaseSvc.uploadImage(path, imagePath, picture.dataUrl);

      await this.firebaseSvc.updateDocument(path, { image: imageUrl });

      user.image = imageUrl;
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
    if (!user) return;

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

      if (baby.id) {
        await this.firebaseSvc.updateDocument(`${path}/${baby.id}`, { photo: imageUrl });
      }

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
    this.router.navigate(['/edit-profile']);
  }

  addBaby() {
    this.router.navigate(['/add-baby']);
  }

  editBaby(baby: any) {
    this.router.navigate(['/edit-baby', baby.id]);
  }

  goToTerms() {
    this.router.navigate(['/terms']);
  }

  goToHelpDesk() {
    this.router.navigate(['/help-desk']);
  }
}
