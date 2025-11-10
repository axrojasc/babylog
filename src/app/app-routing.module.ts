import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'vacunas',
    loadChildren: () =>
      import('./pages/vacunas/vacunas.module').then(m => m.VacunasPageModule)
  },
  {
    path: 'controles',
    loadChildren: () =>
      import('./pages/controles/controles.module').then(m => m.ControlesPageModule)
  },
  {
    path: 'alimentacion',
    loadChildren: () => import('./pages/alimentacion/alimentacion.module').then( m => m.AlimentacionPageModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
];
    path: 'sueno',
    loadChildren: () => import('./pages/sueno/sueno.module').then( m => m.SuenoPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
