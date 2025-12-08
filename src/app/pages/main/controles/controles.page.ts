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

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  alertCtrl = inject(AlertController);

  mostrarFormulario = false;

  controlesRealizados: any[] = [];
  controlesPendientes: any[] = [];

  controlEditandoId: string | null = null;

  ngOnInit() {
    this.loadControles();
  }

  // 🔥 Obtener bebé activo desde localStorage
  getCurrentBaby() {
    return JSON.parse(localStorage.getItem("currentBaby") || "null");
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
    if (!this.form.valid) return;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const baby = this.getCurrentBaby();
      if (!baby) throw new Error('No hay bebé activo seleccionado.');

      const path = `users/${user.uid}/babies/${baby.id}/controles`;

      if (this.controlEditandoId) {
        await this.firebaseSvc.updateDocument(`${path}/${this.controlEditandoId}`, {
          ...this.form.value
        });

        this.utilsSvc.presentToast({
          message: 'Control actualizado correctamente',
          duration: 1500,
          color: 'primary',
          position: 'middle'
        });

      } else {
        await this.firebaseSvc.addDocument(path, {
          ...this.form.value,
          realizado: false
        });

        this.utilsSvc.presentToast({
          message: 'Control guardado correctamente',
          duration: 1500,
          color: 'primary',
          position: 'middle'
        });
      }

      this.loadControles();
      this.cerrarFormulario();

    } catch (error: any) {
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'danger',
        position: 'middle'
      });

    } finally {
      loading.dismiss();
    }
  }

  // 🔥 Eliminar control
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
            const baby = this.getCurrentBaby();

            const path = `users/${user.uid}/babies/${baby.id}/controles/${controlId}`;

            await this.firebaseSvc.deleteDocument(path);

            this.utilsSvc.presentToast({
              message: 'Control eliminado',
              duration: 1500,
              color: 'danger',
              position: 'middle'
            });

            this.loadControles();
          }
        }
      ]
    });

    await alert.present();
  }

  // 🔥 Marcar control como realizado
  async marcarComoRealizado(docId: string, data: any) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const baby = this.getCurrentBaby();

    const path = `users/${user.uid}/babies/${baby.id}/controles/${docId}`;

    return this.firebaseSvc.updateDocument(path, { ...data, realizado: true });
  }

  // 🔥 Cargar controles del bebé activo
  async loadControles() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const baby = this.getCurrentBaby();

      if (!baby) {
        this.controlesPendientes = [];
        this.controlesRealizados = [];
        return;
      }

      const path = `users/${user.uid}/babies/${baby.id}/controles`;

      const controles: any[] = await firstValueFrom(this.firebaseSvc.getCollectionData(path));
      const ahora = new Date().getTime();

      // Marcar como realizados los que ya pasaron
      for (const c of controles) {
        const fechaControl = new Date(c.fecha).getTime();
        if (!c.realizado && fechaControl < ahora) {
          await this.marcarComoRealizado(c.id, c);
        }
      }

      const actualizados: any[] = await firstValueFrom(this.firebaseSvc.getCollectionData(path));

      this.controlesPendientes = actualizados.filter(c => !c.realizado);
      this.controlesRealizados = actualizados.filter(c => c.realizado);

    } catch (error) {
      console.log(error);
    }
  }

  // 🔥 Filtro por búsqueda
  filtrar(lista: any[]) {
    if (!this.busqueda.trim()) return lista;
    return lista.filter(item =>
      item.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }
}
