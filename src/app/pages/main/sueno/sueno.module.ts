import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuenoPageRoutingModule } from './sueno-routing.module';
import { SuenoPage } from './sueno.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SuenoPageRoutingModule,
    SharedModule
  ],
  declarations: [SuenoPage],
})
export class SuenoPageModule {}
