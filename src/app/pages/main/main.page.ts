import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: false,
})
export class MainPage implements OnInit {

  pages = [
    { title: 'Inicio', url: 'home', icon: 'home-outline' },
    { title: 'Perfil', url: 'profile', icon: 'person-outline' },
    { title: 'Sueño', url: 'sueno', icon: '' },
    { title: 'Vacunas', url: 'vacunas', icon: '' },
    { title: 'Controles', url: 'controles', icon: '' },
    { title: 'Alimentación', url: 'alimentacion', icon: '' },
    { title: 'Crecimiento', url: 'crecimiento', icon: '' },
  ]

  router = inject (Router);
  currentPath: string = '';

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if(event?.url) this.currentPath = event.url;
    })
  }

}
