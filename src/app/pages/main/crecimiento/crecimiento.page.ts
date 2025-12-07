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

  ngAfterViewInit() {
    // El gráfico se creará cuando tengamos datos
  }

  ngOnInit() {
    this.loadRegistros();
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
      const pathBase = `users/${user.uid}/crecimiento`;

      if (this.registroEditando) {
        // Editar registro
        await this.firebaseSvc.updateDocument(`${pathBase}/${this.registroEditando.id}`, this.form.value);
        this.utilsSvc.presentToast({
          message: 'Registro actualizado',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      } else {
        // Nuevo registro
        await this.firebaseSvc.addDocument(pathBase, this.form.value);
        this.utilsSvc.presentToast({
          message: 'Registro guardado',
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

  async loadRegistros() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const path = `users/${user.uid}/crecimiento`;

      const data: any = await firstValueFrom(
        this.firebaseSvc.getCollectionData(path)
      );

      // Ordenar por fecha ASC
      this.registros = (data || []).sort((a: any, b: any) =>
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );

      this.generarGrafico();

    } catch (error) {
      console.log(error);
    }
  }

  generarGrafico() {
    if (!this.registros.length) return;

    const meses = this.registros.map(r =>
      new Date(r.fecha).toLocaleString('es-ES', { month: 'short' })
    );

    const tallas = this.registros.map(r => r.talla);

    if (this.chart) {
      this.chart.destroy();
    }

    const canvas: any = document.getElementById('chartCrecimiento');

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: meses,
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
              await this.firebaseSvc.deleteDocument(`users/${user.uid}/crecimiento/${id}`);
              this.utilsSvc.presentToast({
                message: 'Registro eliminado',
                duration: 1500,
                color: 'danger',
                position: 'middle',
                icon: 'trash-outline'
              });
              this.loadRegistros();
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
      ]
    });

    await alert.present();
  }
}
