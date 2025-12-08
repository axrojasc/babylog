import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

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
  alertCtrl = inject(AlertController);

  // Arreglo de bebés para el grid
  babies: any[] = [];

  ngOnInit() {
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
      },
      error: (err) => {
        console.error(err);
        this.babies = [];
      }
    });
  }

  // --- MARCAR BEBÉ COMO PRINCIPAL ---
  async setFavorite(baby: any) {
    const user = this.user();
    if (!user) return;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const path = `users/${user.uid}/babies`;

      // Quitar favorito a todos y dejar solo uno
      for (const b of this.babies) {
        await this.firebaseSvc.updateDocument(`${path}/${b.id}`, {
          isFavorite: b.id === baby.id
        });
      }

      this.loadBabies();

      this.utilsSvc.presentToast({
        message: `${baby.name} ahora es el bebé principal 💖`,
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'star'
      });

    } catch (error) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: 'Error al marcar como principal',
        duration: 1500,
        color: 'danger'
      });
    } finally {
      loading.dismiss();
    }
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

      if (!picture || !picture.dataUrl) {
        await loading.dismiss();
        return;
      }

      const imageUrl = await this.firebaseSvc.uploadImage(path, imagePath, picture.dataUrl);

      await this.firebaseSvc.updateDocument(path, { image: imageUrl });

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

  // ✅ POPUP MESA DE AYUDA
  async goToHelpDesk() {
    const alert = await this.alertCtrl.create({
      header: 'Mesa de ayuda',
      message: `
        Correo de soporte:
          soporte@babylog.cl
          WhatsApp:
          +56 9 1234 5678
          Horario de atención:
          Lunes a Viernes, 09:00 - 18:00 hrs.
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  // ✅ POPUP TÉRMINOS Y CONDICIONES
  async goToTerms() {
    const alert = await this.alertCtrl.create({
      header: 'Términos y condiciones',
      message: `
          1. Uso de la aplicación
          BabyLog está pensada como apoyo para el registro de datos pediátricos
          y no reemplaza en ningún caso la evaluación de un profesional de la salud.

          2. Responsabilidad del usuario
          Eres responsable de la veracidad de la información que ingresas sobre tu bebé
          y del uso que haces de los datos mostrados por la aplicación.

          3. Datos personales
          La información registrada se utiliza solo para el funcionamiento de BabyLog
          y no se comparte con terceros sin tu consentimiento, salvo obligación legal.

          4. Seguridad
          BabyLog implementa medidas razonables de seguridad, pero ningún sistema es
          100% infalible. Te recomendamos usar contraseñas seguras y no compartir tu cuenta.

          5. Soporte
          Ante dudas o problemas, puedes contactar a nuestro equipo a través de la Mesa de ayuda.
        
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }
}
