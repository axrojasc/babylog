import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { UtilsService } from '../../../services/utils.service';
import { firstValueFrom } from 'rxjs';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-vacunas',
  templateUrl: './vacunas.page.html',
  styleUrls: ['./vacunas.page.scss'],
  standalone: false,
})
export class VacunasPage {

  busqueda: string = '';

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    fecha: new FormControl('', [Validators.required]),
    proximaDosis: new FormControl('')
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  alertCtrl = inject(AlertController);

  mostrarFormulario = false;

  registros: any[] = [];
  pendientes: any[] = [];
  realizadas: any[] = [];

  registroEditandoId: string | null = null;

  ngOnInit() {
    this.loadRegistros();
  }

  // 🔥 Obtener bebé activo
  getCurrentBaby() {
    return JSON.parse(localStorage.getItem('currentBaby') || 'null');
  }

  abrirFormulario(registro?: any) {
    this.mostrarFormulario = true;

    if (registro) {
      this.form.patchValue({
        nombre: registro.nombre,
        fecha: registro.fecha,
        proximaDosis: registro.proximaDosis || null
      });
      this.registroEditandoId = registro.id;
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.form.reset();
    this.registroEditandoId = null;
  }

  async guardarRegistro() {
    if (!this.form.valid) return;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const baby = this.getCurrentBaby();
      if (!baby) throw new Error('No hay bebé activo seleccionado.');

      const path = `users/${user.uid}/babies/${baby.id}/vacunas`;

      const payload = {
        nombre: this.form.value.nombre,
        fecha: this.form.value.fecha,
        proximaDosis: this.form.value.proximaDosis || null
      };

      if (this.registroEditandoId) {
        // Actualizar
        await this.firebaseSvc.updateDocument(
          `${path}/${this.registroEditandoId}`,
          payload
        );

        this.utilsSvc.presentToast({
          message: 'Registro actualizado correctamente',
          duration: 1500,
          color: 'primary',
          position: 'middle'
        });

      } else {
        // Nuevo registro
        await this.firebaseSvc.addDocument(path, payload);

        this.utilsSvc.presentToast({
          message: 'Registro guardado correctamente',
          duration: 1500,
          color: 'primary',
          position: 'middle'
        });
      }

      this.loadRegistros();
      this.cerrarFormulario();

    } catch (error: any) {
      console.log(error);

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

  // 🔥 ELIMINAR REGISTRO
  async eliminarRegistro(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Deseas eliminar este registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.utilsSvc.loading();
            await loading.present();

            try {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              const baby = this.getCurrentBaby();

              const path = `users/${user.uid}/babies/${baby.id}/vacunas/${id}`;
              await this.firebaseSvc.deleteDocument(path);

              this.utilsSvc.presentToast({
                message: 'Registro eliminado',
                duration: 1500,
                color: 'danger',
                position: 'middle'
              });

              this.loadRegistros();

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
        }
      ]
    });

    await alert.present();
  }

  // 🔥 CARGAR REGISTROS DEL BEBÉ ACTIVO
  async loadRegistros() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const baby = this.getCurrentBaby();

      if (!baby) {
        this.registros = [];
        this.pendientes = [];
        this.realizadas = [];
        return;
      }

      const path = `users/${user.uid}/babies/${baby.id}/vacunas`;

      const data: any = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      this.registros = data || [];
      this.clasificarRegistros();

    } catch (error) {
      console.log(error);
    }
  }

  // 🔥 CLASIFICACIÓN: realizadas / pendientes
  clasificarRegistros() {
    const hoy = new Date().setHours(0, 0, 0, 0);

    this.pendientes = [];
    this.realizadas = [];

    for (let v of this.registros) {
      const aplicada = v.fecha ? new Date(v.fecha).getTime() : null;
      const proxima = v.proximaDosis ? new Date(v.proximaDosis).getTime() : null;

      const futuraAplicada = aplicada && aplicada > hoy;
      const futuraProxima = proxima && proxima > hoy;

      if (futuraAplicada || futuraProxima) {
        this.pendientes.push(v);
      } else {
        this.realizadas.push(v);
      }
    }
  }

  filtrar(lista: any[]) {
    if (!this.busqueda.trim()) return lista;

    return lista.filter(item =>
      item.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }
}
