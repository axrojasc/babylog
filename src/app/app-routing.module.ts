import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { NoAuthGuard } from './guards/no-auth-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then(m => m.MainPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/auth/register/register.module').then(m => m.RegisterPageModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('src/app/pages/main/profile/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./pages/main/profile/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'add-baby',
    loadChildren: () => import('./pages/main/profile/add-baby/add-baby.module').then( m => m.AddBabyPageModule)
  },
  {
    path: 'edit-baby',
    loadChildren: () => import('./pages/main/profile/edit-baby/edit-baby.module').then( m => m.EditBabyPageModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('./pages/main/profile/terms/terms.module').then( m => m.TermsPageModule)
  },
  {
    path: 'help-desk',
    loadChildren: () => import('./pages/main/profile/help-desk/help-desk.module').then( m => m.HelpDeskPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }