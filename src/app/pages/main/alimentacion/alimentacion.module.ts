import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AlimentacionPageRoutingModule } from './alimentacion-routing.module';

import { AlimentacionPage } from './alimentacion.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AlimentacionPageRoutingModule,
    SharedModule
  ],
  declarations: [AlimentacionPage]
})
export class AlimentacionPageModule {}
