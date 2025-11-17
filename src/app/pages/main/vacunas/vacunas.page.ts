import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-vacunas',
  templateUrl: './vacunas.page.html',
  styleUrls: ['./vacunas.page.scss'],
   standalone: false,
})
export class VacunasPage {
  realizadas = [
    { nombre: 'BCG', fecha: '2025-01-15' },
    { nombre: 'Hepatitis B', fecha: '2025-02-20' }
  ];

  pendientes = [
    { nombre: 'Polio', fecha: '2025-12-10' },
    { nombre: 'SRP', fecha: '2026-01-25' }
  ];

  constructor(private alertCtrl: AlertController) {}

  async addVacuna() {
    const alert = await this.alertCtrl.create({
      header: 'Añadir vacuna',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre de la vacuna' },
        { name: 'fecha', type: 'date' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            this.pendientes.push({ nombre: data.nombre, fecha: data.fecha });
          }
        }
      ]
    });
    await alert.present();
  }
}
