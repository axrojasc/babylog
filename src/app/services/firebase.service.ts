import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { User } from 'src/app/models/user.model'

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {

  auth = inject(AngularFireAuth)

  // ---------- Autenticacion ----------

  // ---------- Acceder ----------

  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // ---------- Crear usuario ----------

  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // ---------- Actualizar usuario ----------
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })
  }
}

