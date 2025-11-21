import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { UtilsService } from '../../../services/utils.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-alimentacion',
  templateUrl: './alimentacion.page.html',
  styleUrls: ['./alimentacion.page.scss'],
  standalone: false,
})
export class AlimentacionPage {

  busqueda: string = '';

  form = new FormGroup({
    alimento: new FormControl('', [Validators.required]),
    cantidad: new FormControl('', [Validators.required]),
    fecha: new FormControl('', [Validators.required])
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  mostrarFormulario = false;
  registros: any[] = [];

  ngOnInit() {
    this.loadRegistros();
  }

  abrirFormulario() { this.mostrarFormulario = true; }
  cerrarFormulario() { this.mostrarFormulario = false; this.form.reset(); }

  async guardarRegistro() {
    if (!this.form.valid) return;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const path = `users/${user.uid}/alimentacion`;

      await this.firebaseSvc.addDocument(path, this.form.value);

      this.utilsSvc.presentToast({
        message: 'Registro guardado correctamente',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });

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

  async loadRegistros() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const path = `users/${user.uid}/alimentacion`;

      const data: any = await firstValueFrom(this.firebaseSvc.getCollectionData(path));
      this.registros = data || [];

      // Ordenar por fecha descendente
      this.registros.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    } catch (error) {
      console.log(error);
    }
  }

  // Función para obtener día de la semana
  getDiaSemana(fechaStr: string): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fecha = new Date(fechaStr);
    return dias[fecha.getDay()];
  }

  // Función para obtener hora
  getHora(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
