import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ControlesPageRoutingModule } from './controles-routing.module';

import { ControlesPage } from './controles.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ControlesPageRoutingModule
  ],
  declarations: [ControlesPage]
})
export class ControlesPageModule {}
