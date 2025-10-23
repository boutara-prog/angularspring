import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Dashboard } from './components/dashboard/dashboard';
import { client } from './components/client/client';
import { fournisseur } from './components/fournisseur/fournisseur';
import { produit } from './components/produit/produit';
import { commande } from './components/commande/commande';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { AuthGuard } from './guards/auth-guard';
import { GuestGuard } from './guards/guest-guard';
import { StockUpdate } from './components/stock-update/stock-update';

const routes: Routes = [
  // Routes d'authentification (accessibles uniquement si non connecté)
  { 
    path: 'login', 
    component: Login,
    canActivate: [GuestGuard] // Empêche l'accès si déjà connecté
  },
  { 
    path: 'register', 
    component: Register,
    canActivate: [GuestGuard] // Empêche l'accès si déjà connecté
  },

  // Routes protégées (accessibles uniquement si connecté)
  { 
    path: 'dashboard', 
    component: Dashboard, 
    canActivate: [AuthGuard] 
  },
  {
    path: 'stock',
    component: StockUpdate,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'FOURNISSEUR'] } // Seuls Admin et Fournisseur peuvent accéder
  },
  { 
    path: 'client', 
    component: client, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'fournisseur', 
    component: fournisseur, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'produit', 
    component: produit, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'commande', 
    component: commande, 
    canActivate: [AuthGuard] 
  },

  // Route par défaut corrigée
  { 
    path: '', 
    redirectTo: '/dashboard', // Ou '/login' si vous préférez
    pathMatch: 'full' 
  },

  // Route wildcard pour les URLs non trouvées
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Mettez à true pour debug
    useHash: false
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }