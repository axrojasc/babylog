import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EditProfilePageRoutingModule } from './edit-profile-routing.module';
import { EditProfilePage } from './edit-profile.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,   // 👈 para [formGroup]
    IonicModule,           // 👈 para ion-content, ion-item, etc.
    SharedModule,          // 👈 para app-header
    EditProfilePageRoutingModule,
  ],
  declarations: [EditProfilePage]  // 👈 AQUÍ, no en imports
})
export class EditProfilePageModule {}
