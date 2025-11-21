import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrecimientoPageRoutingModule } from './crecimiento-routing.module';
import { CrecimientoPage } from './crecimiento.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, CrecimientoPageRoutingModule,SharedModule],
  declarations: [CrecimientoPage],
})
export class CrecimientoPageModule { }
