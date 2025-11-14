import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-crecimiento',
  templateUrl: './crecimiento.page.html',
  styleUrls: ['./crecimiento.page.scss'],
  standalone: false,
})
export class CrecimientoPage {
  @ViewChild('growthChart', { static: false }) growthChart!: ElementRef;
  chart: any;

  mostrarFormulario = false;
  alturaActual: number | null = null;
  fecha: string = '';

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  alturas: number[] = [];

  ngOnInit() {
    const mesActual = new Date().getMonth();
    for (let i = 0; i <= mesActual; i++) {
      this.alturas.push(50 + i * 2 + Math.random() * 2); // crecimiento simulado
    }
  }

  ionViewDidEnter() {
    this.generarGrafico();
  }

  generarGrafico() {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.growthChart.nativeElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(75, 192, 192, 0.4)');
    gradient.addColorStop(1, 'rgba(75, 192, 192, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.meses.slice(0, this.alturas.length),
        datasets: [
          {
            label: 'Altura del bebé (cm)',
            data: this.alturas,
            fill: true,
            backgroundColor: gradient,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#4CAF50',
            pointBorderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#333',
              font: {
                size: 14,
                weight: 'bold',
              },
            },
          },
          title: {
            display: true,
            text: 'Evolución del Crecimiento por Mes',
            color: '#222',
            font: {
              size: 18,
              weight: 'bold',
            },
            padding: { top: 10, bottom: 20 },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#444',
              font: {
                size: 13,
                weight: 500, // ✅ corregido aquí
              },
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45,
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Altura (cm)',
              color: '#333',
              font: { size: 14 },
            },
            ticks: {
              color: '#444',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
        },
      },
    });
  }

  alternarFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  confirmarCrecimiento() {
    if (this.alturaActual && this.fecha) {
      this.alturas.push(this.alturaActual);
      this.chart.data.labels.push(this.obtenerMesDeFecha(this.fecha));
      this.chart.update();

      this.alturaActual = null;
      this.fecha = '';
      this.mostrarFormulario = false;
    }
  }

  obtenerMesDeFecha(fecha: string): string {
    const mesIndex = new Date(fecha).getMonth();
    return this.meses[mesIndex];
  }
}
