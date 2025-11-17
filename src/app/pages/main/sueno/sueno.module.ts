import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuenoPageRoutingModule } from './sueno-routing.module';
import { SuenoPage } from './sueno.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SuenoPageRoutingModule],
  declarations: [SuenoPage],
})
export class SuenoPageModule {}
