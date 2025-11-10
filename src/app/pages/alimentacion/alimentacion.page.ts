import { Component } from '@angular/core';

@Component({
  selector: 'app-alimentacion',
  templateUrl: './alimentacion.page.html',
  styleUrls: ['./alimentacion.page.scss'],
  standalone: false,
})
export class AlimentacionPage {
  mostrarFormulario = false;

  comidas: any[] = [];

  nuevaComida = {
    nombre: '',
    fecha: '',
    hora: '',
    infoNutricional: ''
  };

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  guardarComida() {
    if (this.nuevaComida.nombre && this.nuevaComida.fecha && this.nuevaComida.hora) {
      this.comidas.push({ ...this.nuevaComida });
      this.nuevaComida = { nombre: '', fecha: '', hora: '', infoNutricional: '' };
      this.cerrarFormulario();
    } else {
      alert('Por favor, completa todos los campos obligatorios.');
    }
  }
}
