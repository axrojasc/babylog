import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ControlesPage } from './controles.page';

const routes: Routes = [
  {
    path: '',
    component: ControlesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ControlesPageRoutingModule {}
