import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { UtilsService } from '../../../services/utils.service';
import { firstValueFrom } from 'rxjs';
import { AlertController } from '@ionic/angular';

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
  alertCtrl: AlertController = inject(AlertController);

  mostrarFormulario = false;

  controlesRealizados: any[] = [];
  controlesPendientes: any[] = [];

  controlEditandoId: string | null = null;

  ngOnInit() {
    this.loadControles();
  }

  abrirFormulario(control?: any) {
    this.mostrarFormulario = true;

    if (control) {
      this.form.patchValue({
        nombre: control.nombre,
        fecha: control.fecha
      });
      this.controlEditandoId = control.id;
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.form.reset();
    this.controlEditandoId = null;
  }

  async guardarControl() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const path = `users/${user.uid}/controles`;

        if (this.controlEditandoId) {
          const controlPath = `${path}/${this.controlEditandoId}`;
          await this.firebaseSvc.updateDocument(controlPath, { ...this.form.value });

          this.utilsSvc.presentToast({
            message: 'Control actualizado correctamente',
            duration: 1500,
            color: 'primary',
            position: 'middle',
            icon: 'checkmark-circle-outline'
          });

        } else {
          await this.firebaseSvc.addDocument(path, { ...this.form.value, realizado: false });

          this.utilsSvc.presentToast({
            message: 'Control guardado correctamente',
            duration: 1500,
            color: 'primary',
            position: 'middle',
            icon: 'checkmark-circle-outline'
          });
        }

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

  // ---------------------------------------
  // Eliminación con confirmación
  // ---------------------------------------
  async eliminarControl(controlId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Deseas eliminar este registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const path = `users/${user.uid}/controles/${controlId}`;

            await this.firebaseSvc.deleteDocument(path);
            this.utilsSvc.presentToast({
              message: 'Control eliminado',
              duration: 1500,
              color: 'danger',
              position: 'middle',
              icon: 'trash-outline'
            });

            this.loadControles();
          }
        }
      ]
    });

    await alert.present();
  }

  async marcarComoRealizado(docId: string, data: any) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const path = `users/${user.uid}/controles/${docId}`;
    return this.firebaseSvc.updateDocument(path, { ...data, realizado: true });
  }

  async loadControles() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const path = `users/${user.uid}/controles`;

      const controles: any[] = await firstValueFrom(this.firebaseSvc.getCollectionData(path));

      const ahora = new Date().getTime();

      for (const c of controles) {
        const fechaControl = new Date(c.fecha).getTime();
        if (!c.realizado && fechaControl < ahora) {
          await this.marcarComoRealizado(c.id, c);
        }
      }

      const controlesActualizados: any[] = await firstValueFrom(this.firebaseSvc.getCollectionData(path));
      this.controlesPendientes = controlesActualizados.filter(c => !c.realizado);
      this.controlesRealizados = controlesActualizados.filter(c => c.realizado);

    } catch (error) {
      console.log(error);
    }
  }
}
