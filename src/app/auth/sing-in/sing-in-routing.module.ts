import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SingInPage } from './sing-in.page';

const routes: Routes = [
  {
    path: '',
    component: SingInPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SingInPageRoutingModule {}
