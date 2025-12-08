import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-add-baby',
  templateUrl:'./add-baby.page.html',
  styleUrls: ['./add-baby.page.scss'],
  standalone: false,
})
export class AddBabyPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);
  fb = inject(FormBuilder);

  form!: FormGroup;
  user!: User;

  today: string = new Date().toISOString();

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      weight: ['', []],
      height: ['', []],
      bloodType: ['', []],
      allergies: ['', []],
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const path = `users/${this.user.uid}/babies`;

      const babyData = {
        ...this.form.value,
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };

      await this.firebaseSvc.addDocument(path, babyData);

      this.utilsSvc.presentToast({
        message: 'Bebé agregado correctamente',
        color: 'success',
        duration: 1500,
        position: 'middle',
      });

      // Volvemos al perfil
      this.router.navigate(['/profile']);
    } catch (error) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: 'Error al agregar bebé',
        color: 'danger',
        duration: 2000,
        position: 'middle',
      });
    } finally {
      loading.dismiss();
    }
  }

  cancel() {
    this.router.navigate(['/profile']);
  }
}
