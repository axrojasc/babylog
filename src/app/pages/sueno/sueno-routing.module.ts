import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuenoPage } from './sueno.page';

const routes: Routes = [
  {
    path: '',
    component: SuenoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuenoPageRoutingModule {}
