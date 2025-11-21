import { Component, inject, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { UtilsService } from '../../../services/utils.service';
import { firstValueFrom } from 'rxjs';
import Chart from 'chart.js/auto';

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

  chart: any;

  ngOnInit() {
    this.loadRegistros();
  }

  ngAfterViewInit() {
    setTimeout(() => this.generarGrafico(), 500);
  }

  abrirFormulario() { this.mostrarFormulario = true; }
  cerrarFormulario() { this.mostrarFormulario = false; this.form.reset(); }

  // -------------------------
  // Calcular duración automáticamente
  // -------------------------
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
    // calcular duración antes de guardar
    this.calcularDuracion();

    if (!this.form.valid) return;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const path = `users/${user.uid}/sueno`;

      await this.firebaseSvc.addDocument(path, this.form.value);

      this.loadRegistros();
      this.generarGrafico();

      this.cerrarFormulario();

      this.utilsSvc.presentToast({
        message: 'Registro guardado',
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
    } finally {
      loading.dismiss();
    }
  }

  async loadRegistros() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const path = `users/${user.uid}/sueno`;

      const data: any = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      this.registros = data || [];
      this.generarGrafico();

    } catch (error) {
      console.log(error);
    }
  }

  // -------------------------
  // GRAFICO
  // -------------------------
  generarGrafico() {
    const ctx = document.getElementById('suenoChart') as any;
    if (!ctx) return;

    if (this.chart) this.chart.destroy();

    // Crear arreglo de días de la semana
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const valores = [0, 0, 0, 0, 0, 0, 0];

    this.registros.forEach(r => {
      const inicio = new Date(r.inicio);
      const dur = parseFloat(r.duracion);
      const day = inicio.getDay(); // 0 = Domingo

      const indice = day === 0 ? 6 : day - 1;
      valores[indice] += dur;
    });

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dias,
        datasets: [{
          label: 'Horas de sueño',
          data: valores
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

}
