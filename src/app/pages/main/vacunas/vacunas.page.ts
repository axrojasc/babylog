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

  firebaseSvc: FirebaseService = inject(FirebaseService);
  utilsSvc: UtilsService = inject(UtilsService);
  alertCtrl: AlertController = inject(AlertController);

  mostrarFormulario = false;

  registros: any[] = [];
  pendientes: any[] = [];
  realizadas: any[] = [];

  // Variable para editar
  registroEditandoId: string | null = null;

  ngOnInit() {
    this.loadRegistros();
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
      const path = `users/${user.uid}/vacunas`;

      const formValue = { ...this.form.value };
      if (!formValue.proximaDosis) formValue.proximaDosis = null;

      if (this.registroEditandoId) {
        // Editar registro existente
        const registroPath = `${path}/${this.registroEditandoId}`;
        await this.firebaseSvc.updateDocument(registroPath, formValue);

        this.utilsSvc.presentToast({
          message: 'Registro actualizado correctamente',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });

      } else {
        // Agregar nuevo registro
        await this.firebaseSvc.addDocument(path, formValue);

        this.utilsSvc.presentToast({
          message: 'Registro guardado correctamente',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'checkmark-circle-outline'
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
        position: 'middle',
        icon: 'alert-circle-outline'
      });

    } finally {
      loading.dismiss();
    }
  }

  // --- ELIMINAR CON CONFIRMACIÓN ---
  async eliminarRegistro(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Deseas eliminar este registro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const path = `users/${user.uid}/vacunas/${id}`;
            await this.firebaseSvc.deleteDocument(path);
            this.utilsSvc.presentToast({
              message: 'Registro eliminado',
              duration: 1500,
              color: 'danger',
              position: 'middle',
              icon: 'trash-outline'
            });
            this.loadRegistros();
          }
        }
      ]
    });

    await alert.present();
  }

  async loadRegistros() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const path = `users/${user.uid}/vacunas`;

      const data: any = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      this.registros = data || [];
      this.clasificarRegistros();

    } catch (error) {
      console.log(error);
    }
  }

  clasificarRegistros() {
    const hoy = new Date().setHours(0, 0, 0, 0);

    this.pendientes = [];
    this.realizadas = [];

    for (let r of this.registros) {
      const fechaAplicada = r.fecha ? new Date(r.fecha).getTime() : null;
      const proxima = r.proximaDosis ? new Date(r.proximaDosis).getTime() : null;

      const esFuturaAplicada = fechaAplicada && fechaAplicada > hoy;
      const esFuturaProxima = proxima && proxima > hoy;

      if (esFuturaAplicada || esFuturaProxima) {
        this.pendientes.push(r);
      } else {
        this.realizadas.push(r);
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
