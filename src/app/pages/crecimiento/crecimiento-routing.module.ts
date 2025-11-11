import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrecimientoPage } from './crecimiento.page';

const routes: Routes = [
  {
    path: '',
    component: CrecimientoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrecimientoPageRoutingModule {}
