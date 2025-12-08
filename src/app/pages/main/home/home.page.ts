import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);

  userData!: User;
  babies: any[] = [];
  favoriteBaby: any = null;

  loading = true;

  // Lo que ya usabas
  image: any[] = [];
  ultimoSueno: string | null = null;
  proximaVacunaNombre: string | null = null;
  proximaVacuna: string | null = null;
  proximoControlNombre: string | null = null;
  proximoControl: string | null = null;
  ultimaComida: string | null = null;
  ultimaComidaCantidad: string | null = null;
  ultimoPeso: string | null = null;
  ultimaAltura: string | null = null;

  ngOnInit() {}

  ionViewWillEnter() {
    this.userData = this.utilsSvc.getFromLocalStorage('user');
    this.loadFavoriteBaby();
  }

  // 🔥 Cargar bebé favorito y luego los resúmenes de ese bebé
  loadFavoriteBaby() {
    const user = this.userData;
    if (!user) return;

    const path = `users/${user.uid}/babies`;

    this.firebaseSvc.getCollectionData(path).subscribe({
      next: (babies: any[]) => {
        this.babies = babies;

        // 1) Intentamos usar el que tenga isFavorite en Firebase
        let favorite = babies.find(b => b.isFavorite);

        // 2) Si no hay, intentamos usar el guardado en localStorage
        const currentBabyLS = this.utilsSvc.getFromLocalStorage('currentBaby');
        if (!favorite && currentBabyLS) {
          favorite = babies.find(b => b.id === currentBabyLS.id);
        }

        this.favoriteBaby = favorite || null;

        if (this.favoriteBaby) {
          this.image = [{
            image: this.favoriteBaby.photo,
            name: `${this.favoriteBaby.firstName} ${this.favoriteBaby.lastName}`
          }];

          // Guardamos también en localStorage para otras vistas
          this.utilsSvc.setInLocalStorage('currentBaby', {
            id: this.favoriteBaby.id,
            firstName: this.favoriteBaby.firstName,
            lastName: this.favoriteBaby.lastName,
            photo: this.favoriteBaby.photo || null,
          });

          // 🟢 Aquí vuelves a cargar TODAS tus métricas pero filtrando por bebé
          this.loadResumenSueno(this.favoriteBaby.id);
          this.loadResumenVacunas(this.favoriteBaby.id);
          this.loadResumenControles(this.favoriteBaby.id);
          this.loadResumenAlimentacion(this.favoriteBaby.id);
          this.loadResumenCrecimiento(this.favoriteBaby.id);

        } else {
          // Sin bebé seleccionado
          this.image = [];
          this.resetResumenes();
        }

        this.loading = false;
      },
      error: err => {
        console.error('Error cargando bebés:', err);
        this.loading = false;
      }
    });
  }

  resetResumenes() {
    this.ultimoSueno = null;
    this.proximaVacunaNombre = null;
    this.proximaVacuna = null;
    this.proximoControlNombre = null;
    this.proximoControl = null;
    this.ultimaComida = null;
    this.ultimaComidaCantidad = null;
    this.ultimoPeso = null;
    this.ultimaAltura = null;
  }

  // 🟣 EJEMPLOS DE FUNCIONES PARA CARGAR INFO POR BEBÉ
  // 👉 Aquí metes tu lógica vieja, pero filtrando por babyId

  loadResumenSueno(babyId: string) {
    const user = this.userData;
    const path = `users/${user.uid}/babies/${babyId}/sueno`;

    this.firebaseSvc.getCollectionData(path).subscribe(registros => {
      // Aquí tomas el último registro de sueño y calculas lo que ya hacías:
      // this.ultimoSueno = ...
      // Ejemplo simplificado:
      const lista: any[] = registros as any[];
      if (lista.length) {
        const ultimo = lista[lista.length - 1];
        this.ultimoSueno = ultimo.duracion || null;
      } else {
        this.ultimoSueno = null;
      }
    });
  }

loadResumenVacunas(babyId: string) {
  const user = this.userData;
  if (!user) return;

  const path = `users/${user.uid}/babies/${babyId}/vacunas`;

  this.firebaseSvc.getCollectionData(path).subscribe({
    next: (registros: any[]) => {
      const lista = (registros || []) as any[];

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // 1) Tomamos SOLO las que tengan próxima dosis
      const proximas = lista
        .filter(v => !!v.proximaDosis)
        .map(v => {
          const fechaMs = new Date(v.proximaDosis).getTime();
          return { ...v, fechaMs };
        })
        // 2) Solo fechas futuras o de hoy
        .filter(v => !isNaN(v.fechaMs) && v.fechaMs >= hoy.getTime())
        // 3) Ordenamos por la más cercana
        .sort((a, b) => a.fechaMs - b.fechaMs);

      if (proximas.length) {
        const prox = proximas[0];
        this.proximaVacunaNombre = prox.nombre || null;
        this.proximaVacuna = new Date(prox.proximaDosis).toLocaleDateString('es-CL');
      } else {
        this.proximaVacunaNombre = null;
        this.proximaVacuna = null;
      }
    },
    error: err => {
      console.error('Error cargando vacunas:', err);
      this.proximaVacunaNombre = null;
      this.proximaVacuna = null;
    }
  });
}


  loadResumenControles(babyId: string) {
    const user = this.userData;
    const path = `users/${user.uid}/babies/${babyId}/controles`;

    this.firebaseSvc.getCollectionData(path).subscribe(registros => {
      const lista: any[] = registros as any[];

      // Busca el próximo control
      if (lista.length) {
        const prox = lista[0]; // ajusta a tu criterio
        this.proximoControlNombre = prox.nombre || null;
        this.proximoControl = prox.fecha || null;
      } else {
        this.proximoControlNombre = null;
        this.proximoControl = null;
      }
    });
  }

  loadResumenAlimentacion(babyId: string) {
    const user = this.userData;
    const path = `users/${user.uid}/babies/${babyId}/alimentacion`;

    this.firebaseSvc.getCollectionData(path).subscribe(registros => {
      const lista: any[] = registros as any[];

      if (lista.length) {
        const ultima = lista[lista.length - 1];
        this.ultimaComida = ultima.tipo || null;
        this.ultimaComidaCantidad = ultima.cantidad || null;
      } else {
        this.ultimaComida = null;
        this.ultimaComidaCantidad = null;
      }
    });
  }

  loadResumenCrecimiento(babyId: string) {
    const user = this.userData;
    const path = `users/${user.uid}/babies/${babyId}/crecimiento`;

    this.firebaseSvc.getCollectionData(path).subscribe(registros => {
      const lista: any[] = registros as any[];

      if (lista.length) {
        const ultimo = lista[lista.length - 1];
        this.ultimoPeso = ultimo.peso || null;
        this.ultimaAltura = ultimo.altura || null;
      } else {
        this.ultimoPeso = null;
        this.ultimaAltura = null;
      }
    });
  }

  // Refresher
  doRefresh(event: any) {
    this.loadFavoriteBaby();
    setTimeout(() => event.target.complete(), 800);
  }

  // Navegaciones
  addUpdateImage() {
    this.router.navigate(['/profile']);
  }

goToSueno() {
  this.router.navigate(['/main/sueno']);
}

goToVacunas() {
  this.router.navigate(['/main/vacunas']);
}

goToControles() {
  this.router.navigate(['/main/controles']);
}

goToPeso() {
  // página de alimentación
  this.router.navigate(['/main/alimentacion']);
}

  goToSueno() { this.router.navigate(['/main/sueno']); }
  goToVacunas() { this.router.navigate(['/main/vacunas']); }
  goToControles() { this.router.navigate(['/main/controles']); }
  goToPeso() { this.router.navigate(['/main/alimentacion']); }
  goToCrecimiento() { this.router.navigate(['/main/crecimiento']); }
  goToChatbot() { this.router.navigate(['/main/chatbot']); }

  // Usuario para el template
  user() {
    return this.utilsSvc.getFromLocalStorage('user');
  }
}
