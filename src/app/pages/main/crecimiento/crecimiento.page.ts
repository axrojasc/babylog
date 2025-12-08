import { Component, inject, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { UtilsService } from '../../../services/utils.service';
import { firstValueFrom } from 'rxjs';
import Chart from 'chart.js/auto';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crecimiento',
  templateUrl: './crecimiento.page.html',
  styleUrls: ['./crecimiento.page.scss'],
  standalone: false,
})
export class CrecimientoPage implements AfterViewInit {

  busqueda: string = '';
  chart: any;
  mostrarFormulario = false;

  form = new FormGroup({
    peso: new FormControl('', [Validators.required]),
    talla: new FormControl('', [Validators.required]),
    fecha: new FormControl('', [Validators.required])
  });

  registros: any[] = [];
  registroEditando: any = null;

  firebaseSvc: FirebaseService = inject(FirebaseService);
  utilsSvc: UtilsService = inject(UtilsService);
  alertCtrl: AlertController = inject(AlertController);

  ngOnInit() {
    this.loadRegistros();
  }

  ngAfterViewInit() {
    // El gráfico se genera después de cargar datos
  }

  // 🔥 Obtener bebé activo
  getCurrentBaby() {
    return JSON.parse(localStorage.getItem('currentBaby') || 'null');
  }

  abrirFormulario(registro: any = null) {
    this.mostrarFormulario = true;
    if (registro) {
      this.registroEditando = registro;
      this.form.patchValue({
        peso: registro.peso,
        talla: registro.talla,
        fecha: registro.fecha
      });
    } else {
      this.registroEditando = null;
      this.form.reset();
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.form.reset();
    this.registroEditando = null;
  }

  async guardarRegistro() {
    if (!this.form.valid) return;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const baby = this.getCurrentBaby();
      if (!baby) throw new Error('No hay bebé activo seleccionado.');

      const pathBase = `users/${user.uid}/babies/${baby.id}/crecimiento`;

      if (this.registroEditando) {
        // Editar registro
        await this.firebaseSvc.updateDocument(
          `${pathBase}/${this.registroEditando.id}`,
          this.form.value
        );

        this.utilsSvc.presentToast({
          message: 'Registro actualizado',
          duration: 1500,
          color: 'primary',
          position: 'middle'
        });

      } else {
        // Nuevo registro
        await this.firebaseSvc.addDocument(pathBase, this.form.value);

        this.utilsSvc.presentToast({
          message: 'Registro guardado',
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

  async loadRegistros() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const baby = this.getCurrentBaby();

      if (!baby) {
        this.registros = [];
        if (this.chart) this.chart.destroy();
        return;
      }

      const path = `users/${user.uid}/babies/${baby.id}/crecimiento`;

      const data: any = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      this.registros = (data || []).sort((a: any, b: any) =>
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );

      this.generarGrafico();

    } catch (error) {
      console.log(error);
    }
  }

  generarGrafico() {
    if (this.chart) {
      this.chart.destroy();
    }

    if (!this.registros.length) return;

    const labels = this.registros.map(r =>
      new Date(r.fecha).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short'
      })
    );

    const tallas = this.registros.map(r => Number(r.talla));

    const canvas: any = document.getElementById('chartCrecimiento');
    if (!canvas) return;

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Talla (cm)',
            data: tallas,
            fill: false,
            borderWidth: 3,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
  }

  async eliminarRegistro(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
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

              const path = `users/${user.uid}/babies/${baby.id}/crecimiento/${id}`;
              await this.firebaseSvc.deleteDocument(path);

              this.utilsSvc.presentToast({
                message: 'Registro eliminado',
                duration: 1500,
                color: 'danger',
                position: 'middle'
              });

              this.loadRegistros();

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
        }
      ]
    });

    await alert.present();
  }

  // 🔍 Filtro por búsqueda (por fecha o talla/peso, si lo usas en el HTML)
  filtrar(lista: any[]) {
    if (!this.busqueda.trim()) return lista;

    const query = this.busqueda.toLowerCase();
    return lista.filter(item =>
      String(item.peso).toLowerCase().includes(query) ||
      String(item.talla).toLowerCase().includes(query) ||
      String(item.fecha).toLowerCase().includes(query)
    );
  }
}
