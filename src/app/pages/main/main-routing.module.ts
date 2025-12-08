import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage,
    children: [
      {
        path: 'home',loadChildren: () =>import('./home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'sueno', loadChildren: () => import('./sueno/sueno.module').then(m => m.SuenoPageModule)
      },
      {
        path: 'vacunas', loadChildren: () => import('./vacunas/vacunas.module').then(m => m.VacunasPageModule)
      },
      {
        path: 'controles', loadChildren: () => import('./controles/controles.module').then(m => m.ControlesPageModule)
      },
      {
        path: 'alimentacion', loadChildren: () => import('./alimentacion/alimentacion.module').then(m => m.AlimentacionPageModule)
      },
      {
      path: 'crecimiento', loadChildren: () => import('./crecimiento/crecimiento.module').then(m => m.CrecimientoPageModule)
      },
    ]
  },  {
    path: 'chatbot',
    loadChildren: () => import('./chatbot/chatbot.module').then( m => m.ChatbotPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
