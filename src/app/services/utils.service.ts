import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {

  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  modalCtrl = inject(ModalController);
  router = inject(Router);

  // ---------- TOMAR FOTO ----------
  async takePicture(promptLabelHeader: string) {
    return await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelHeader,
      promptLabelPhoto: 'Selecciona una imagen',
      promptLabelPicture: 'Toma una foto'
    });
  }

  // ---------- Loading ----------
  loading() {
    return this.loadingCtrl.create({ spinner: 'crescent' });
  }

  // ---------- Toast ----------
  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  // ---------- Navegación ----------
  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  // ================================================================
  // 🚀 LOCAL STORAGE – SISTEMA COMPLETO (COMPATIBLE CON TODO)
  // ================================================================

  // Método nuevo y actualizado
  setInLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Método antiguo (tu app lo usa en varios archivos)
  // → Lo mantenemos para evitar errores.
  saveInLocalStorage(key: string, value: any) {
    this.setInLocalStorage(key, value);
  }

  // Obtener desde localStorage
  getFromLocalStorage(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // Eliminar del localStorage
  removeFromLocalStorage(key: string) {
    localStorage.removeItem(key);
  }

  // ---------- Modal ----------
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalCtrl.create(opts);
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) return data;
  }

  dismissModal(data?: any) {
    return this.modalCtrl.dismiss(data);
  }
}
