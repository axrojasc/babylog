import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditBabyPage } from './edit-baby.page';

const routes: Routes = [
  {
    path: '',
    component: EditBabyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditBabyPageRoutingModule {}
