import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-edit-baby',
  templateUrl: './edit-baby.page.html',
  styleUrls: ['./edit-baby.page.scss'],
  standalone: false,
})
export class EditBabyPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);

  form!: FormGroup;
  user!: User;
  babyId!: string;

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    this.babyId = this.route.snapshot.paramMap.get('id') as string;
    this.buildForm();
    this.loadBaby();
  }

  buildForm() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      weight: [''],
      height: [''],
      bloodType: [''],
      allergies: [''],
      isFavorite: [false],
    });
  }

  async loadBaby() {
    if (!this.babyId) return;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const path = `users/${this.user.uid}/babies/${this.babyId}`;
      const baby: any = await this.firebaseSvc.getDocument(path);

      if (baby) {
        this.form.patchValue({
          firstName: baby.firstName || '',
          lastName: baby.lastName || '',
          birthDate: baby.birthDate || '',
          weight: baby.weight || '',
          height: baby.height || '',
          bloodType: baby.bloodType || '',
          allergies: baby.allergies || '',
          isFavorite: baby.isFavorite || false,
        });
      }
    } catch (error) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: 'Error al cargar datos del bebé',
        color: 'danger',
        duration: 2000,
        position: 'middle',
      });
    } finally {
      loading.dismiss();
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const path = `users/${this.user.uid}/babies/${this.babyId}`;
      await this.firebaseSvc.updateDocument(path, this.form.value);

      this.utilsSvc.presentToast({
        message: 'Datos del bebé actualizados correctamente',
        color: 'success',
        duration: 1500,
        position: 'middle',
      });

      this.router.navigate(['/profile']);
    } catch (error) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: 'Error al actualizar datos del bebé',
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
