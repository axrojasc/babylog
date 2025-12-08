import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AddBabyPageRoutingModule } from './add-baby-routing.module';
import { AddBabyPage } from './add-baby.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddBabyPageRoutingModule,
    SharedModule,
  ],
  declarations: [AddBabyPage],
})
export class AddBabyPageModule {}
