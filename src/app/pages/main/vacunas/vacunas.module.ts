import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { VacunasPageRoutingModule } from './vacunas-routing.module';
import { VacunasPage } from './vacunas.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VacunasPageRoutingModule,
    SharedModule,
  ],
  declarations: [VacunasPage]
})
export class VacunasPageModule {}
