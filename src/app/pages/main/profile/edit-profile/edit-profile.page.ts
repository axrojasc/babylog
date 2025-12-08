import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: false, // 👈 IMPORTANTE: NO standalone
})
export class EditProfilePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phone: new FormControl(''),
    email: new FormControl({ value: '', disabled: true })
  });

  user!: User;

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');

    if (this.user) {
      this.form.patchValue({
        name: this.user.name || '',
        lastName: this.user.lastName || '',
        phone: this.user.phone || '',
        email: this.user.email || ''
      });
    }
  }

  async saveProfile() {
    if (!this.form.valid) return;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const path = `users/${this.user.uid}`;

      const updatedData = {
        name: this.form.value.name,
        lastName: this.form.value.lastName,
        phone: this.form.value.phone
      };

      await this.firebaseSvc.updateDocument(path, updatedData);

      const updatedUser = { ...this.user, ...updatedData };
      this.utilsSvc.setInLocalStorage('user', updatedUser);

      this.utilsSvc.presentToast({
        message: 'Perfil actualizado correctamente',
        color: 'success',
        duration: 1500
      });

      this.router.navigate(['/main/profile']);

    } catch (error) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: 'Error al actualizar el perfil',
        color: 'danger',
        duration: 1500
      });
    } finally {
      loading.dismiss();
    }
  }
}
