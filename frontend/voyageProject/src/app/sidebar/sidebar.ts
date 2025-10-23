import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/AuthService.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  template: `
    <div class="sidebar">
      <nav class="nav flex-column">
        <!-- Tableau de bord - Tous les rôles -->
        <a class="nav-link" 
           routerLink="/dashboard" 
           routerLinkActive="active"
           [routerLinkActiveOptions]="{exact: true}">
          <i class="fas fa-tachometer-alt"></i>
          Tableau de bord
        </a>

        <!-- Produits - Tous les rôles -->
        <a class="nav-link"  
           routerLink="/produit" 
           routerLinkActive="active">
          <i class="fas fa-box"></i>
          Produits
        </a>

        <!-- Fournisseurs - ADMIN, CLIENT, FOURNISSEUR -->
        <a class="nav-link" 
           routerLink="/fournisseur" 
           routerLinkActive="active">
          <i class="fas fa-truck"></i>
          Fournisseurs
        </a>

        <!-- Commandes - ADMIN et CLIENT uniquement -->
        <a class="nav-link" 
           routerLink="/commandes" 
           routerLinkActive="active"
           *ngIf="hasPermission(['ADMIN', 'CLIENT'])">
          <i class="fas fa-shopping-cart"></i>
          Commandes
        </a>

        <!-- Clients - ADMIN uniquement -->
        <a class="nav-link" 
           routerLink="/clients" 
           routerLinkActive="active"
           *ngIf="hasPermission(['ADMIN'])">
          <i class="fas fa-users"></i>
          Clients
        </a>

        <!-- Gestion Stock - ADMIN et FOURNISSEUR -->
        <a class="nav-link" 
           routerLink="/stock" 
           routerLinkActive="active"
           *ngIf="hasPermission(['ADMIN', 'FOURNISSEUR'])">
          <i class="fas fa-warehouse"></i>
          Gestion Stock
        </a>

       

        <!-- Paramètres - Tous les rôles -->
        <a class="nav-link" 
           routerLink="/parametres" 
           routerLinkActive="active">
          <i class="fas fa-cog"></i>
          Paramètres
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar {
      background: #34495e;
      min-height: calc(100vh - 76px);
      padding: 0;
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    }

    .nav-link {
      color: #bdc3c7 !important;
      padding: 15px 20px;
      border-left: 3px solid transparent;
      transition: all 0.3s ease;
      text-decoration: none;
      display: block;
    }

    .nav-link:hover,
    .nav-link.active {
      background-color: rgba(52, 152, 219, 0.1);
      color: #3498db !important;
      border-left-color: #3498db;
    }

    .nav-link i {
      width: 20px;
      margin-right: 10px;
    }

    @media (max-width: 768px) {
      .sidebar {
        min-height: auto;
      }
    }
  `]
})
export class Sidebar implements OnInit {
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Mettre à jour l'utilisateur à chaque changement de route
        this.currentUser = this.authService.getCurrentUser();
      }
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Sidebar - Utilisateur connecté:', this.currentUser);
    console.log('Sidebar - Rôle:', this.currentUser?.role || this.currentUser?.userRole);
  }

  hasPermission(roles: string[]): boolean {
    if (!this.currentUser) {
      return false;
    }
    
    // Récupérer le rôle de l'utilisateur (compatible avec différentes structures)
    const userRole = (this.currentUser.role || this.currentUser.userRole || '').toUpperCase();
    
    if (!userRole) {
      return false;
    }
    
    // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
    return roles.some(role => role.toUpperCase() === userRole);
  }
}