import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  
  const firebaseSvc = inject(FirebaseService);
  const utilsSvc = inject(UtilsService);

  const user = utilsSvc.getFromLocalStorage('user');

  if (user) {
    return true;
  } else {
    utilsSvc.routerLink('/auth');
    return false;
  }
};