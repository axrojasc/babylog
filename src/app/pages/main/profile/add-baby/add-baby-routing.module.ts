import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddBabyPage } from './add-baby.page';

const routes: Routes = [
  {
    path: '',
    component: AddBabyPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddBabyPageRoutingModule {}
