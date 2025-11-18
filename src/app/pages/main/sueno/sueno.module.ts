import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuenoPageRoutingModule } from './sueno-routing.module';
import { SuenoPage } from './sueno.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SuenoPageRoutingModule,SharedModule],
  declarations: [SuenoPage],
})
export class SuenoPageModule {}
