import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
   standalone: false,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col-lg-4 col-md-6">
            <h5><i class="fas fa-boxes"></i> StockPro</h5>
            <p>Solution complète de gestion de stock pour optimiser vos opérations commerciales et améliorer votre productivité.</p>
            <div>
              <a href="#" class="me-3"><i class="fab fa-facebook fa-2x"></i></a>
              <a href="#" class="me-3"><i class="fab fa-twitter fa-2x"></i></a>
              <a href="#" class="me-3"><i class="fab fa-linkedin fa-2x"></i></a>
              <a href="#"><i class="fab fa-instagram fa-2x"></i></a>
            </div>
          </div>
          <div class="col-lg-2 col-md-6">
            <h5>Navigation</h5>
            <ul class="list-unstyled">
              <li><a routerLink="/dashboard">Tableau de bord</a></li>
              <li><a routerLink="/produits">Produits</a></li>
              <li><a routerLink="/fournisseurs">Fournisseurs</a></li>
              <li><a routerLink="/commandes">Commandes</a></li>
            </ul>
          </div>
          <div class="col-lg-2 col-md-6">
            <h5>Support</h5>
            <ul class="list-unstyled">
              <li><a href="#">Centre d'aide</a></li>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Tutoriels</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div class="col-lg-4 col-md-6">
            <h5>Contact</h5>
            <ul class="list-unstyled">
              <li><i class="fas fa-map-marker-alt"></i> 123 Rue du Commerce, Casablanca, Maroc</li>
              <li><i class="fas fa-phone"></i> +212 522 123 456</li>
              <li><i class="fas fa-envelope"></i> contact@stockpro.ma</li>
            </ul>
            <h5 class="mt-3">Newsletter</h5>
            <div class="input-group">
              <input type="email" class="form-control" placeholder="Votre email" [(ngModel)]="emailNewsletter">
              <button class="btn btn-primary" (click)="subscribeNewsletter()">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <p>&copy; {{ currentYear }} StockPro. Tous droits réservés. | 
          <a href="#">Politique de confidentialité</a> | 
          <a href="#">Conditions d'utilisation</a></p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #2c3e50;
      color: white;
      padding: 3rem 0 1rem;
      margin-top: 4rem;
    }

    .footer h5 {
      color: #3498db;
      margin-bottom: 1rem;
    }

    .footer a {
      color: #bdc3c7;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer a:hover {
      color: #3498db;
    }

    .footer-bottom {
      background: #1a252f;
      margin-top: 2rem;
      padding: 1rem 0;
      text-align: center;
    }

    .list-unstyled li {
      margin-bottom: 0.5rem;
    }

    .list-unstyled i {
      width: 20px;
      margin-right: 10px;
    }
  `]
})
export class Footer {
  currentYear = new Date().getFullYear();
  emailNewsletter = '';

  subscribeNewsletter(): void {
    if (this.emailNewsletter) {
      // Logique d'inscription à la newsletter
      console.log('Email inscrit:', this.emailNewsletter);
      alert('Merci pour votre inscription !');
      this.emailNewsletter = '';
    }
  }
}