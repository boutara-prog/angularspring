import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/AuthService.service';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <!-- Header - Affiché seulement si utilisateur connecté -->
    <app-header *ngIf="shouldShowLayout()"></app-header>

    <div class="app-container" [class.with-layout]="shouldShowLayout()">
      <!-- Sidebar + Main Content Layout pour les pages authentifiées -->
      <div class="container-fluid p-0" *ngIf="shouldShowLayout()">
        <div class="row g-0">
          <!-- Sidebar -->
          <div class="col-lg-2 col-md-3">
            <app-sidebar></app-sidebar>
          </div>

          <!-- Main Content -->
          <div class="col-lg-10 col-md-9">
            <main class="main-content">
              <router-outlet></router-outlet>
            </main>
          </div>
        </div>
      </div>

      <!-- Layout sans sidebar pour les pages non authentifiées (login, etc.) -->
      <main *ngIf="!shouldShowLayout()" class="full-page-layout">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Footer - Affiché seulement si utilisateur connecté -->
    <app-footer *ngIf="shouldShowLayout()"></app-footer>

    <!-- Toast Container pour les notifications -->
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 11">
      <!-- Les toasts seront ajoutés dynamiquement ici -->
    </div>
  `,
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  title = 'StockPro';
  currentRoute = '';

  // Pages qui ne doivent pas afficher le layout complet (sidebar + header)
  noLayoutRoutes = ['/login', '/register', '/forgot-password', '/404', '/403'];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Écouter les changements de route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        console.log('Route actuelle:', this.currentRoute);
      }
    });
  }

  ngOnInit(): void {
    // Initialize app
    this.checkAuthentication();
  }

  /**
   * Détermine si le layout complet (header + sidebar + footer) doit être affiché
   */
  shouldShowLayout(): boolean {
    const isAuthenticatedRoute = !this.noLayoutRoutes.some(route => 
      this.currentRoute.startsWith(route)
    );
    const isUserAuthenticated = this.authService.isAuthenticated();
    
    return isAuthenticatedRoute && isUserAuthenticated;
  }

  /**
   * Vérifie l'authentification au démarrage
   */
  private checkAuthentication(): void {
    const isAuthRoute = this.noLayoutRoutes.some(route => 
      this.currentRoute.startsWith(route)
    );

    if (!this.authService.isAuthenticated() && !isAuthRoute) {
      console.log('Utilisateur non authentifié, redirection vers login');
      this.router.navigate(['/login']);
    }
  }
}