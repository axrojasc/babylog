import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { UtilsService } from '../../../services/utils.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-controles',
  templateUrl: './controles.page.html',
  styleUrls: ['./controles.page.scss'],
  standalone: false,
})
export class ControlesPage {

  busqueda: string = '';

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    fecha: new FormControl('', [Validators.required])
  });

  firebaseSvc: FirebaseService = inject(FirebaseService);
  utilsSvc: UtilsService = inject(UtilsService);

  mostrarFormulario = false;

  controlesRealizados: any[] = [];
  controlesPendientes: any[] = [];

  ngOnInit() {
    this.loadControles();
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.form.reset();
  }

  async guardarControl() {
    if (this.form.valid) {

      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const path = `users/${user.uid}/controles`;

        await this.firebaseSvc.addDocument(path, {
          ...this.form.value,
          realizado: false
        });

        this.utilsSvc.presentToast({
          message: 'Control guardado correctamente',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });

        this.loadControles();
        this.cerrarFormulario();

      } catch (error: any) {
        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });

      } finally {
        loading.dismiss();
      }
    }
  }

  // ✔ Método actualizado con la estructura correcta de updateDocument
  async marcarComoRealizado(docId: string, data: any) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const path = `users/${user.uid}/controles/${docId}`;

    return this.firebaseSvc.updateDocument(path, {
      ...data,
      realizado: true
    });
  }

  async loadControles() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const path = `users/${user.uid}/controles`;

      // ✔ Obtener controles
      const controles: any[] = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      const ahora = new Date().getTime();

      // ✔ Revisión de vencimiento
      for (const c of controles) {
        const fechaControl = new Date(c.fecha).getTime();

        if (!c.realizado && fechaControl < ahora) {
          await this.marcarComoRealizado(c.id, c);
        }
      }

      // ✔ Recargar con la información ya actualizada
      const controlesActualizados: any[] = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      this.controlesPendientes = controlesActualizados.filter(c => !c.realizado);
      this.controlesRealizados = controlesActualizados.filter(c => c.realizado);

    } catch (error) {
      console.log(error);
    }
  }

}
