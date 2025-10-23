// ============================================================================
// GUEST GUARD - guards/guest-guard.ts
// ============================================================================
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/AuthService.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Vérifier si on est dans le navigateur
    if (!this.authService.isBrowser()) {
      return true; // Laisser passer pour SSR
    }

    // Si l'utilisateur est déjà connecté, rediriger vers dashboard
    if (this.authService.isAuthenticated()) {
      console.log('GuestGuard: User already authenticated - redirecting to dashboard');
      this.router.navigate(['/dashboard'], { replaceUrl: true });
      return false;
    }

    return true;
  }
}