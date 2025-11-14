import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.model';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false,
})
export class AuthPage {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })
  private readonly router = inject(Router);

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService)

  ngOnInit() {
  }

  async submit() {
    if (this.form.valid) {

      const loading = await this.utilsSvc.loading();
      await loading.present();

      this.firebaseSvc.signIn(this.form.value as User).then(res => {

          console.log(res);

      }).catch(error => {
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })

      }).finally(() => {
        loading.dismiss();
      })
    
    }

  }
}

