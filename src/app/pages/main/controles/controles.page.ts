import { Component } from '@angular/core';

@Component({
  selector: 'app-controles',
  templateUrl: './controles.page.html',
  styleUrls: ['./controles.page.scss'],
  standalone: false,
})
export class ControlesPage {
  busqueda = '';
  mostrarFormulario = false;

  controlesRealizados = [
    { nombre: 'Control 1', fecha: '2025-01-10' },
    { nombre: 'Control 2', fecha: '2025-03-22' },
  ];

  controlesPendientes = [
    { nombre: 'Control pediátrico', fecha: '2025-11-15' },
    { nombre: 'Control nutricional', fecha: '2025-12-05' },
  ];

  nuevoControl = { nombre: '', fecha: '' };

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.nuevoControl = { nombre: '', fecha: '' };
  }

  guardarControl() {
    if (this.nuevoControl.nombre) {
      this.controlesPendientes.push({ ...this.nuevoControl });
      this.cerrarFormulario();
    }
  }
}
