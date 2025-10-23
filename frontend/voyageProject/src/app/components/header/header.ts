import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/AuthService.service';

@Component({
  selector: 'app-header',
  standalone: false,
  template: `
    <header class="header">
      <nav class="navbar navbar-expand-lg">
        <div class="container-fluid">
          <a class="navbar-brand" routerLink="/dashboard">
            <i class="fas fa-boxes"></i>
            StockPro
          </a>
          
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <!-- Tableau de bord - Tous -->
              <li class="nav-item" *ngIf="hasPermission(['ADMIN'])">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                  <i class="fas fa-tachometer-alt"></i> Tableau de bord
                </a>
              </li>
              
              <!-- Produits - Tous -->
              <li class="nav-item">
                <a class="nav-link" routerLink="/produit" routerLinkActive="active">
                  <i class="fas fa-box"></i> Produits
                </a>
              </li>
              
              <!-- Fournisseurs - Tous -->
              <li class="nav-item" >
                <a class="nav-link" routerLink="/fournisseur" routerLinkActive="active">
                  <i class="fas fa-truck"></i> Fournisseurs
                </a>
              </li>
              
              <!-- Commandes - ADMIN et CLIENT uniquement -->
              <li class="nav-item" *ngIf="hasPermission(['ADMIN', 'CLIENT'])">
                <a class="nav-link" routerLink="/commande" routerLinkActive="active">
                  <i class="fas fa-shopping-cart"></i> Commandes
                </a>
              </li>
              
              <!-- Clients - ADMIN uniquement -->
              <li class="nav-item" *ngIf="hasPermission(['ADMIN'])">
                <a class="nav-link" routerLink="/clients" routerLinkActive="active">
                  <i class="fas fa-users"></i> Clients
                </a>
              </li>
              
              <!-- Stock - ADMIN et FOURNISSEUR -->
              <li class="nav-item" *ngIf="hasPermission(['ADMIN', 'FOURNISSEUR'])">
                <a class="nav-link" routerLink="/stock" routerLinkActive="active">
                  <i class="fas fa-warehouse"></i> Stock
                </a>
              </li>
              
              
            </ul>
            
            <div class="user-info" *ngIf="currentUser">
              <div class="user-avatar">{{ getUserInitials() }}</div>
              <div>
                <div style="font-size: 0.9rem;">{{ getUserDisplayName() }}</div>
                <div style="font-size: 0.75rem; opacity: 0.8;">{{ getUserRole() }}</div>
              </div>
              <div class="dropdown ms-3">
                <button class="btn btn-outline-light btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                  <i class="fas fa-cog"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                 <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" (click)="logout()" style="cursor: pointer;">
                    <i class="fas fa-sign-out-alt"></i> Déconnexion
                  </a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1030;
    }

    .navbar-brand {
      font-size: 1.8rem;
      font-weight: 700;
      color: white !important;
    }

    .navbar-brand i {
      margin-right: 10px;
      color: #f39c12;
    }

    .nav-link {
      color: white !important;
      font-weight: 500;
      transition: all 0.3s ease;
      margin: 0 5px;
      border-radius: 5px;
      padding: 8px 16px !important;
    }

    .nav-link:hover, .nav-link.active {
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .user-info {
      display: flex;
      align-items: center;
      color: white;
    }

    .user-avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background: #f39c12;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      font-weight: bold;
    }

    .dropdown-item {
      cursor: pointer;
    }
  `]
})
export class Header implements OnInit {
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Header - Utilisateur:', this.currentUser);
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    const nom = this.currentUser.nom || this.currentUser.username || '';
    const prenom = this.currentUser.prenom || '';
    return (nom.charAt(0) + prenom.charAt(0)).toUpperCase() || 'U';
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';
    const nom = this.currentUser.nom || '';
    const prenom = this.currentUser.prenom || '';
    return nom && prenom ? `${nom} ${prenom}` : this.currentUser.username || this.currentUser.email || 'Utilisateur';
  }

  getUserRole(): string {
    if (!this.currentUser) return '';
    const role = this.currentUser.role || this.currentUser.userRole || '';
    return role.toUpperCase();
  }

  hasPermission(roles: string[]): boolean {
    if (!this.currentUser) {
      return false;
    }
    
    const userRole = (this.currentUser.role || this.currentUser.userRole || '').toUpperCase();
    
    if (!userRole) {
      return false;
    }
    
    return roles.some(role => role.toUpperCase() === userRole);
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}