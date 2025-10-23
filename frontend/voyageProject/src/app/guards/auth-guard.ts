// ============================================================================
// AUTH GUARD - guards/auth-guard.ts
// ============================================================================
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/AuthService.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Vérifier si on est dans le navigateur
    if (!this.authService.isBrowser()) {
      return true; // Laisser passer pour SSR
    }

    if (this.authService.isAuthenticated()) {
      return true;
    }

    console.log('AuthGuard: Access denied - redirecting to login');
    console.log('Current URL:', state.url);
    
    // Stocker l'URL demandée pour redirection après login
    // SUPPRIMEZ replaceUrl: true pour conserver les queryParams
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
      // replaceUrl: true retiré - c'est ça qui cause le problème !
    });
    
    return false;
  }
}