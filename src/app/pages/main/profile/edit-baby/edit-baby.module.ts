import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditBabyPageRoutingModule } from './edit-baby-routing.module';

import { EditBabyPage } from './edit-baby.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditBabyPageRoutingModule
  ],
  declarations: [EditBabyPage]
})
export class EditBabyPageModule {}
