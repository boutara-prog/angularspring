import { Component, OnInit } from '@angular/core';
import { Stock } from '../../models/stock.model';
import { Produit } from '../../models/produit.model';
import { Fournisseur } from '../../models/fournisseur.model';
import { StockService } from '../../services/stock.service';
import { ProduitService } from '../../services/produit.service';
import { FournisseurService } from '../../services/fournisseur.service';
import { AuthService } from '../../services/AuthService.service';

@Component({
  selector: 'app-stock-update',
  standalone: false,
  templateUrl: './stock-update.html',
  styleUrl: './stock-update.scss'
})
export class StockUpdate implements OnInit {
  stocks: Stock[] = [];
  produits: Produit[] = [];
  fournisseurs: Fournisseur[] = [];
  
  selectedFournisseurId: number | null = null;
  selectedStock: Stock | null = null;
  showUpdateForm = false;
  
  currentUser: any = null;
  userRole: string = '';
  isFournisseur: boolean = false;
  isAdmin: boolean = false;

  // Pour la mise à jour de quantité
  updateQuantite: number = 0;

  // Filtres
  searchFilters = {
    fournisseurId: null as number | null,
    statut: '' as string, // 'rupture' | 'faible' | 'stock' | ''
    nomProduit: ''
  };

  constructor(
    private stockService: StockService,
    private produitService: ProduitService,
    private fournisseurService: FournisseurService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadFournisseurs();
    this.loadStocks();
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('User connecté:', this.currentUser);
    
    if (this.currentUser) {
      const role = (this.currentUser.userRole || this.currentUser.role || '').toUpperCase();
      this.userRole = role;
      this.isFournisseur = role === 'FOURNISSEUR';
      this.isAdmin = role === 'ADMIN';

      console.log('🔐 User Role:', this.userRole);
      console.log('✅ IsAdmin:', this.isAdmin);
      console.log('✅ IsFournisseur:', this.isFournisseur);
    }
  }

  loadFournisseurs(): void {
    if (this.isFournisseur && this.currentUser?.idFour) {
      // Fournisseur : charger uniquement son profil
      this.fournisseurService.getFournisseurById(this.currentUser.idFour).subscribe({
        next: (data) => {
          console.log('🏢 Fournisseur connecté:', data);
          this.fournisseurs = [data];
          this.selectedFournisseurId = data.idFour || null;
        },
        error: (error) => console.error('Erreur lors du chargement du fournisseur:', error)
      });
    } 
    else if (this.isAdmin) {
      // Admin : charger tous les fournisseurs
      this.fournisseurService.getAllFournisseurs().subscribe({
        next: (data) => {
          console.log('👑 Tous les fournisseurs:', data);
          this.fournisseurs = data;
        },
        error: (error) => console.error('Erreur lors du chargement des fournisseurs:', error)
      });
    }
  }

  loadStocks(): void {
    this.stockService.getAllStocks().subscribe({
      next: (data) => {
        console.log('📦 Stocks récupérés:', data);
        console.log('📦 Stocks récupérés:', this.currentUser?.idFour);
        console.log('📦 Stocks récupérés:', this.isFournisseur);
        
        if (this.isFournisseur && this.currentUser?.idFour) {
          // Filtrer les stocks du fournisseur connecté
          
          this.stocks = data.filter(stock => 
            stock.produit?.fournisseur?.idFour === this.currentUser.idFour
          );
          console.log('🏢 Stocks du fournisseur:', this.stocks);
        } 
        else if (this.isAdmin) {
          // Admin voit tous les stocks
          this.stocks = data;
          console.log('👑 Tous les stocks:', this.stocks);
        }
      },
      error: (error) => console.error('Erreur lors du chargement des stocks:', error)
    });
  }

  loadStocksByFournisseur(): void {
    if (this.isFournisseur) {
      return; // Le fournisseur ne peut pas changer de filtre
    }

    if (this.selectedFournisseurId) {
      this.stockService.getAllStocks().subscribe({
        next: (data) => {
          this.stocks = data.filter(stock => 
            stock.produit?.fournisseur?.idFour === this.selectedFournisseurId
          );
        },
        error: (error) => console.error('Erreur lors du filtrage:', error)
      });
    } else {
      this.loadStocks();
    }
  }

  applyFilters(): void {
    this.stockService.getAllStocks().subscribe({
      next: (data) => {
        let filteredStocks = data;

        // Filtre fournisseur (Admin seulement)
        if (this.isFournisseur && this.currentUser?.idFour) {
          filteredStocks = filteredStocks.filter(stock => 
            stock.produit?.fournisseur?.idFour === this.currentUser.idFour
          );
        } else if (this.searchFilters.fournisseurId) {
          filteredStocks = filteredStocks.filter(stock => 
            stock.produit?.fournisseur?.idFour === this.searchFilters.fournisseurId
          );
        }

        // Filtre par nom de produit
        if (this.searchFilters.nomProduit) {
          const searchTerm = this.searchFilters.nomProduit.toLowerCase();
          filteredStocks = filteredStocks.filter(stock => 
            stock.produit?.nomProd?.toLowerCase().includes(searchTerm)
          );
        }

        // Filtre par statut de stock
        if (this.searchFilters.statut === 'rupture') {
          filteredStocks = filteredStocks.filter(stock => stock.quantiteStock === 0);
        } else if (this.searchFilters.statut === 'faible') {
          filteredStocks = filteredStocks.filter(stock => 
            stock.quantiteStock > 0 && stock.quantiteStock <= 5
          );
        } else if (this.searchFilters.statut === 'stock') {
          filteredStocks = filteredStocks.filter(stock => stock.quantiteStock > 5);
        }

        this.stocks = filteredStocks;
        console.log('🔍 Stocks filtrés:', this.stocks);
      },
      error: (error) => console.error('Erreur lors du filtrage:', error)
    });
  }

  clearFilters(): void {
    this.searchFilters = {
      fournisseurId: null,
      statut: '',
      nomProduit: ''
    };
    
    if (this.isFournisseur) {
      this.selectedFournisseurId = this.currentUser?.idFour;
    } else {
      this.selectedFournisseurId = null;
    }
    
    this.loadStocks();
  }

  openUpdateForm(stock: Stock): void {
    if (!this.canUpdateStock(stock)) {
      alert('Vous n\'avez pas la permission de modifier ce stock');
      return;
    }

    this.selectedStock = stock;
    this.updateQuantite = stock.quantiteStock;
    this.showUpdateForm = true;
  }

  saveQuantite(): void {
    if (!this.selectedStock || !this.selectedStock.produit?.id) {
      alert('Erreur: Produit non trouvé');
      return;
    }

    if (this.updateQuantite < 0) {
      alert('La quantité ne peut pas être négative');
      return;
    }

    this.stockService.updateQuantite(this.selectedStock.produit.id, this.updateQuantite)
      .subscribe({
        next: () => {
          console.log('✅ Stock mis à jour avec succès');
          alert('Stock mis à jour avec succès');
          this.loadStocks();
          this.hideUpdateForm();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          alert('Erreur lors de la mise à jour du stock');
        }
      });
  }

  hideUpdateForm(): void {
    this.showUpdateForm = false;
    this.selectedStock = null;
    this.updateQuantite = 0;
  }

  getStockStatus(quantite: number): string {
    if (quantite === 0) return 'Rupture de stock';
    if (quantite <= 5) return 'Stock faible';
    return 'En stock';
  }

  getStockClass(quantite: number): string {
    if (quantite === 0) return 'text-danger';
    if (quantite <= 5) return 'text-warning';
    return 'text-success';
  }

  getStockBadgeClass(quantite: number): string {
    if (quantite === 0) return 'bg-danger';
    if (quantite <= 5) return 'bg-warning';
    return 'bg-success';
  }

  // Statistiques
  getTotalProduits(): number {
    return this.stocks.length;
  }

  getProduitsEnRupture(): number {
    return this.stocks.filter(s => s.quantiteStock === 0).length;
  }

  getProduitsStockFaible(): number {
    return this.stocks.filter(s => s.quantiteStock > 0 && s.quantiteStock <= 5).length;
  }

  getProduitsEnStock(): number {
    return this.stocks.filter(s => s.quantiteStock > 5).length;
  }

  // Permissions
  canUpdateStock(stock: Stock): boolean {
    if (this.isAdmin) {
      return true;
    }
    
    if (this.isFournisseur && this.currentUser?.idFour) {
      return stock.produit?.fournisseur?.idFour === this.currentUser.idFour;
    }
    
    return false;
  }

  // Grouper les stocks par fournisseur (Admin uniquement)
  getStocksByFournisseur(): Map<string, Stock[]> {
    const grouped = new Map<string, Stock[]>();
    
    this.stocks.forEach(stock => {
      const fournisseurNom = stock.produit?.fournisseur?.entreprise || 'Non assigné';
      if (!grouped.has(fournisseurNom)) {
        grouped.set(fournisseurNom, []);
      }
      grouped.get(fournisseurNom)?.push(stock);
    });
    
    return grouped;
  }
}