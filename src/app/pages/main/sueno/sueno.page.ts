import { Component, inject, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { UtilsService } from '../../../services/utils.service';
import { firstValueFrom } from 'rxjs';
import Chart from 'chart.js/auto';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-sueno',
  templateUrl: './sueno.page.html',
  styleUrls: ['./sueno.page.scss'],
  standalone: false,
})
export class SuenoPage implements AfterViewInit {

  busqueda: string = '';
  mostrarFormulario = false;
  registros: any[] = [];
  form = new FormGroup({
    inicio: new FormControl('', [Validators.required]),
    fin: new FormControl('', [Validators.required]),
    duracion: new FormControl('', [Validators.required])
  });
  firebaseSvc: FirebaseService = inject(FirebaseService);
  utilsSvc: UtilsService = inject(UtilsService);
  alertController: AlertController = inject(AlertController);
  chart: any;

  registroEditandoId: string | null = null;

  ngOnInit() {
    this.loadRegistros();
  }

  ngAfterViewInit() {
    setTimeout(() => this.generarGrafico(), 500);
  }

  abrirFormulario(registro?: any) {
    this.mostrarFormulario = true;
    if (registro) {
      this.form.patchValue({
        inicio: registro.inicio,
        fin: registro.fin,
        duracion: registro.duracion
      });
      this.registroEditandoId = registro.id;
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.form.reset();
    this.registroEditandoId = null;
  }

  calcularDuracion() {
    const inicio = new Date(this.form.value.inicio || '');
    const fin = new Date(this.form.value.fin || '');
    if (!isNaN(inicio.getTime()) && !isNaN(fin.getTime())) {
      const difMs = fin.getTime() - inicio.getTime();
      const difHoras = (difMs / 1000 / 60 / 60).toFixed(2);
      this.form.patchValue({ duracion: difHoras });
    }
  }

  async guardarRegistro() {
    this.calcularDuracion();
    if (!this.form.valid) return;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const path = `users/${user.uid}/sueno`;

      if (this.registroEditandoId) {
        const registroPath = `${path}/${this.registroEditandoId}`;
        await this.firebaseSvc.updateDocument(registroPath, this.form.value);
        this.utilsSvc.presentToast({
          message: 'Registro actualizado',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      } else {
        await this.firebaseSvc.addDocument(path, this.form.value);
        this.utilsSvc.presentToast({
          message: 'Registro guardado',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      }

      this.loadRegistros();
      this.generarGrafico();
      this.cerrarFormulario();

    } catch (error: any) {
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

  // ✅ Método eliminar con confirmación
  async eliminarRegistro(id: string) {
    const alert = await this.alertController.create({
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
            const path = `users/${user.uid}/sueno/${id}`;
            await this.firebaseSvc.deleteDocument(path);
            this.utilsSvc.presentToast({
              message: 'Registro eliminado',
              duration: 1500,
              color: 'danger',
              position: 'middle',
              icon: 'trash-outline'
            });
            this.loadRegistros();
            this.generarGrafico();
          }
        }
      ]
    });
    await alert.present();
  }

  async loadRegistros() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const path = `users/${user.uid}/sueno`;
      const data: any = await firstValueFrom(this.firebaseSvc.getCollectionData(path));
      this.registros = data || [];
      this.generarGrafico();
    } catch (error) {
      console.log(error);
    }
  }

  generarGrafico() {
    const ctx = document.getElementById('suenoChart') as any;
    if (!ctx) return;
    if (this.chart) this.chart.destroy();

    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const valores = [0, 0, 0, 0, 0, 0, 0];

    this.registros.forEach(r => {
      const inicio = new Date(r.inicio);
      const dur = parseFloat(r.duracion);
      const day = inicio.getDay();
      const indice = day === 0 ? 6 : day - 1;
      valores[indice] += dur;
    });

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: { labels: dias, datasets: [{ label: 'Horas de sueño', data: valores }] },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  }

  filtrar(lista: any[]) {
    if (!this.busqueda.trim()) return lista;
    return lista.filter(item => item.inicio.toLowerCase().includes(this.busqueda.toLowerCase()));
  }
}
