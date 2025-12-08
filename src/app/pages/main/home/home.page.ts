import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Imagen } from 'src/app/models/image.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateImageComponent } from 'src/app/shared/components/add-update-image/add-update-image.component';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  alertController = inject(AlertController);

  image: Imagen[] = [];
  loading: boolean = false;

  // Próximo control
  proximoControl: string | null = null;
  proximoControlNombre: string | null = null;

  // Próxima vacuna
  proximaVacuna: string | null = null;
  proximaVacunaNombre: string | null = null;

  // Último registro de sueño
  ultimoSueno: string | null = null;

  // Último registro de alimentación
  ultimaComida: string | null = null;
  ultimaComidaCantidad: string | null = null;

  // Último registro de crecimiento
  ultimoPeso: string | null = null;
  ultimaAltura: string | null = null;

  ngOnInit() {}

  ionViewWillEnter() {
    this.getImage();
    this.loadProximoControl();
    this.loadProximaVacuna();
    this.loadUltimoSueno();
    this.loadUltimaComida();
    this.loadUltimoCrecimiento(); // <-- AGREGADO
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  doRefresh(event) {
    setTimeout(() => {
      this.getImage();
      this.loadProximoControl();
      this.loadProximaVacuna();
      this.loadUltimoSueno();
      this.loadUltimaComida();
      this.loadUltimoCrecimiento(); // <-- AGREGADO
      event.target.complete();
    }, 1000);
  }

  getImage() {
    let path = `users/${this.user().uid}/image`;

    this.loading = true;

    let sub = this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        this.image = res;
        this.loading = false;
        sub.unsubscribe();
      }
    });
  }

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
    let path = `users/${this.user().uid}/image/${image.id}`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      let imagePath = await this.firebaseSvc.getFilePath(image.image);
      await this.firebaseSvc.deleteFile(imagePath);
      await this.firebaseSvc.deleteDocument(path);

      this.image = this.image.filter(p => p.id !== image.id);

      this.utilsSvc.presentToast({
        message: 'Perfil eliminado exitosamente',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });

    } catch (error: any) {
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }

    loading.dismiss();
  }

  async confirmDelete(image: Imagen) {
    const alert = await this.alertController.create({
      header: 'Eliminar imagen',
      message: '¿Estás seguro de que deseas eliminar esta imagen de perfil?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteImage(image)
        }
      ]
    });

    await alert.present();
  }

  // ========================
  // Próximo control
  // ========================
  async loadProximoControl() {
    try {
      const uid = this.user().uid;
      const path = `users/${uid}/controles`;

      const registros: any[] = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      if (!registros.length) {
        this.proximoControl = null;
        this.proximoControlNombre = null;
        return;
      }

      const hoy = new Date();

      const futuras = registros
        .filter(r => new Date(r.fecha) >= hoy)
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      if (!futuras.length) {
        this.proximoControl = null;
        this.proximoControlNombre = null;
        return;
      }

      const proximo = futuras[0];
      this.proximoControl = new Date(proximo.fecha).toLocaleDateString('es-CL');
      this.proximoControlNombre = proximo.nombre || null;

    } catch (error) {
      console.log(error);
      this.proximoControl = null;
      this.proximoControlNombre = null;
    }
  }

  // ========================
  // Próxima vacuna
  // ========================
  async loadProximaVacuna() {
    try {
      const uid = this.user().uid;
      const path = `users/${uid}/vacunas`;

      const registros: any[] = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      if (!registros.length) {
        this.proximaVacuna = null;
        this.proximaVacunaNombre = null;
        return;
      }

      const hoy = new Date();

      const futuras = registros
        .filter(r => new Date(r.fecha) >= hoy)
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      if (!futuras.length) {
        this.proximaVacuna = null;
        this.proximaVacunaNombre = null;
        return;
      }

      const proxima = futuras[0];
      this.proximaVacuna = new Date(proxima.fecha).toLocaleDateString('es-CL');
      this.proximaVacunaNombre = proxima.nombre || null;

    } catch (error) {
      console.log(error);
      this.proximaVacuna = null;
      this.proximaVacunaNombre = null;
    }
  }

  // ========================
  // Último sueño
  // ========================
  async loadUltimoSueno() {
    try {
      const uid = this.user().uid;
      const path = `users/${uid}/sueno`;

      const data: any[] = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      if (!data.length) {
        this.ultimoSueno = null;
        return;
      }

      data.sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());

      const ultimo = data[0];
      this.ultimoSueno = `${ultimo.duracion} h`;

    } catch (e) {
      console.log('Error cargando último sueño:', e);
      this.ultimoSueno = null;
    }
  }

  // ========================
  // Última comida
  // ========================
  async loadUltimaComida() {
    try {
      const uid = this.user().uid;
      const path = `users/${uid}/alimentacion`;

      const data: any[] = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      if (!data.length) {
        this.ultimaComida = null;
        this.ultimaComidaCantidad = null;
        return;
      }

      data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      const ultima = data[0];
      this.ultimaComida = ultima.alimento || null;
      this.ultimaComidaCantidad = ultima.cantidad || null;

    } catch (e) {
      console.log('Error cargando última comida:', e);
      this.ultimaComida = null;
      this.ultimaComidaCantidad = null;
    }
  }

  // ========================
  // ÚLTIMO CRECIMIENTO
  // ========================
  async loadUltimoCrecimiento() {
    try {
      const uid = this.user().uid;
      const path = `users/${uid}/crecimiento`;

      const data: any[] = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      if (!data.length) {
        this.ultimoPeso = null;
        this.ultimaAltura = null;
        return;
      }

      data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      const ultimo = data[0];

      this.ultimoPeso = ultimo.peso || null;
      this.ultimaAltura = ultimo.altura || null;

    } catch (e) {
      console.log('Error cargando último crecimiento:', e);
      this.ultimoPeso = null;
      this.ultimaAltura = null;
      
    }
  }

  // ========================
  // Navegar
  // ========================
  private readonly router = inject(Router);

  goToSueno() { this.router.navigate(['/main/sueno']); }
  goToVacunas() { this.router.navigate(['/main/vacunas']); }
  goToControles() { this.router.navigate(['/main/controles']); }
  goToPeso() { this.router.navigate(['/main/alimentacion']); }
  goToCrecimiento() { this.router.navigate(['/main/crecimiento']); }
  goToChatbot() { this.router.navigate(['/main/chatbot']); }

}
