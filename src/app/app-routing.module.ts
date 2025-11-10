import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
