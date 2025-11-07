import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  constructor(private firestore: AngularFirestore) {
    console.log('AppComponent cargado — verificando Firebase...');
    this.checkFirebaseConnection();
  }

  async checkFirebaseConnection() {
    try {
      const test = await this.firestore.collection('test').get().toPromise();
      console.log('Conexión a Firebase exitosa:', test?.size, 'documentos encontrados.');
    } catch (error) {
      console.error('Error al conectar con Firebase:', error);
    }
  }
}