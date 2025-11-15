import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-sueno',
  templateUrl: './sueno.page.html',
  styleUrls: ['./sueno.page.scss'],
  standalone: false,
})
export class SuenoPage {
  @ViewChild('sleepChart', { static: false }) sleepChart!: ElementRef;
  chart: any;

  mostrarFormulario = false;
  horaDormir: string = '';
  horaDespertar: string = '';

  dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  horasSueno = [7, 6, 8, 5, 7, 9, 6]; // datos simulados

  ionViewDidEnter() {
    this.generarGrafico();
  }

  generarGrafico() {
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.sleepChart.nativeElement, {
      type: 'bar',
      data: {
        labels: this.dias,
        datasets: [
          {
            label: 'Horas de Sueño',
            data: this.horasSueno,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Horas' },
          },
        },
      },
    });
  }

  alternarFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  confirmarSueno() {
    // Por ahora solo simula, no guarda nada en BD.
    console.log('Hora de dormir:', this.horaDormir);
    console.log('Hora de despertar:', this.horaDespertar);

    // Aquí más adelante puedes hacer la conexión al backend o BD
    // Ejemplo:
    // this.apiService.registrarSueno({ horaDormir, horaDespertar });

    this.mostrarFormulario = false;
    this.horaDormir = '';
    this.horaDespertar = '';
  }
}
