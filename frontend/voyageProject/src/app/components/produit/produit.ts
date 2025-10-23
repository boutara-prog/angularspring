import { Component, OnInit } from '@angular/core';
import { Produit } from '../../models/produit.model';
import { Fournisseur } from '../../models/fournisseur.model';
import { ProduitService } from '../../services/produit.service';
import { FournisseurService } from '../../services/fournisseur.service';
import { AuthService } from '../../services/AuthService.service';
import { PanierService } from '../../services/panier.service';

@Component({
  selector: 'app-produit',
  standalone: false,
  templateUrl: './produit.html',
  styleUrl: './produit.scss'
})
export class produit implements OnInit {
  produits: Produit[] = [];
  fournisseurs: Fournisseur[] = [];
  selectedProduit: Produit | null = null;
  selectedFournisseurId: number | null | undefined = null;
  isEditing = false;
  showForm = false;

  currentUser: any = null;
  userRole: string = '';
  isFournisseur: boolean = false;
  isAdmin: boolean = false;
  isClient: boolean = false;

  // Variables pour le panier (CLIENTS uniquement)
  nombreArticlesPanier: number = 0;
  totalPanier: number = 0;

  searchFilters = {
    nom: '',
    fournisseurId: null as number | null,
    prixMin: null as number | null,
    prixMax: null as number | null
  };

  newProduit: Produit = {
    nomProd: '',
    description: '',
    prix: 0,
    quantiteStock: 0,
    fournisseur: null
  };

  constructor(
    private produitService: ProduitService,
    private fournisseurService: FournisseurService,
    private authService: AuthService,
    private panierService: PanierService
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadFournisseurs();
    this.loadProduits();
    
    if (this.isClient) {
      this.updatePanierInfo();
      
      this.panierService.panier$.subscribe(() => {
        this.updatePanierInfo();
      });
    }
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('User connecté:', this.currentUser);
    
    if (this.currentUser) {
      const role = (this.currentUser.userRole || this.currentUser.role || '').toUpperCase();
      this.userRole = role;
      this.isFournisseur = role === 'FOURNISSEUR';
      this.isAdmin = role === 'ADMIN';
      this.isClient = role === 'CLIENT';

      console.log('🔐 User Role:', this.userRole);
      console.log('✅ IsAdmin:', this.isAdmin);
      console.log('✅ IsFournisseur:', this.isFournisseur);
      console.log('✅ IsClient:', this.isClient);
    }
  }

  loadProduits(): void {
    if (this.isFournisseur && this.currentUser?.idFour) {
      this.produitService.getProduitsByFournisseur(this.currentUser.idFour).subscribe({
        next: (data) => {
          console.log('🏢 Produits du fournisseur:', data);
          this.produits = data;
        },
        error: (error) => console.error('Erreur lors du chargement des produits:', error)
      });
    } 
    else if (this.isAdmin || this.isClient) {
      this.produitService.getAllProduits().subscribe({
        next: (data) => {
          console.log('👑 Tous les produits:', data);
          this.produits = data.map(p => ({ ...p, selectedQuantite: 1 }));
        },
        error: (error) => console.error('Erreur lors du chargement des produits:', error)
      });
    }
  }

  loadFournisseurs(): void {
    if (this.isFournisseur && this.currentUser?.idFour) {
      this.fournisseurService.getFournisseurById(this.currentUser.idFour).subscribe({
        next: (data) => {
          console.log('🏢 Fournisseur connecté:', data);
          this.fournisseurs = [data];
          this.selectedFournisseurId = data.idFour;
          this.newProduit.fournisseur = data;
        },
        error: (error) => console.error('Erreur lors du chargement du fournisseur:', error)
      });
    } 
    else if (this.isAdmin || this.isClient) {
      this.fournisseurService.getAllFournisseurs().subscribe({
        next: (data) => {
          console.log('👑 Tous les fournisseurs:', data);
          this.fournisseurs = data;
        },
        error: (error) => console.error('Erreur lors du chargement des fournisseurs:', error)
      });
    }
  }

  loadProduitsByFournisseur(): void {
    if (this.isFournisseur) {
      return;
    }

    if (this.selectedFournisseurId) {
      this.produitService.getProduitsByFournisseur(this.selectedFournisseurId).subscribe({
        next: (data) => {
          this.produits = data.map(p => ({ ...p, selectedQuantite: 1 }));
        },
        error: (error) => console.error('Erreur lors du filtrage par fournisseur:', error)
      });
    } else {
      this.loadProduits();
    }
  }

  searchProduits(): void {
    const fournisseurIdFilter = this.isFournisseur 
      ? this.currentUser?.idFour 
      : this.searchFilters.fournisseurId || undefined;

    this.produitService.rechercherProduits(
      this.searchFilters.nom || undefined,
      fournisseurIdFilter,
      this.searchFilters.prixMin || undefined,
      this.searchFilters.prixMax || undefined
    ).subscribe({
      next: (data) => {
        console.log('🔍 Résultats de recherche:', data);
        this.produits = data.map(p => ({ ...p, selectedQuantite: 1 }));
      },
      error: (error) => console.error('Erreur lors de la recherche:', error)
    });
  }

  clearFilters(): void {
    this.searchFilters = {
      nom: '',
      fournisseurId: null,
      prixMin: null,
      prixMax: null
    };
    
    if (this.isFournisseur) {
      this.selectedFournisseurId = this.currentUser?.idFour;
    } else {
      this.selectedFournisseurId = null;
    }
    
    this.loadProduits();
  }

  // ===== FONCTIONS PANIER (CLIENTS uniquement) =====
  
  ajouterAuPanier(produit: Produit): void {
    if (!this.isClient) {
      return;
    }

    const quantite = produit.selectedQuantite || 1;
    
    if (quantite > produit.quantiteStock) {
      alert('Quantité demandée supérieure au stock disponible');
      return;
    }

    this.panierService.ajouterAuPanier(produit, quantite);
    alert(`${produit.nomProd} ajouté au panier (x${quantite})`);
    
    produit.selectedQuantite = 1;
  }

  updatePanierInfo(): void {
    this.nombreArticlesPanier = this.panierService.getNombreArticles();
    this.totalPanier = this.panierService.getTotalPanier();
  }

  // ===== FONCTIONS ADMIN/FOURNISSEUR =====

  showAddForm(): void {
    if (!this.canAddProduit()) {
      alert('Vous n\'avez pas la permission d\'ajouter des produits');
      return;
    }

    this.showForm = true;
    this.isEditing = false;
    this.selectedProduit = null;
    this.resetForm();
    
    if (this.isFournisseur && this.fournisseurs.length > 0) {
      this.newProduit.fournisseur = this.fournisseurs[0];
    }
  }

  editProduit(produit: Produit): void {
    if (!this.canEditProduit(produit)) {
      alert('Vous n\'avez pas la permission de modifier ce produit');
      return;
    }

    this.showForm = true;
    this.isEditing = true;
    this.selectedProduit = produit;
    
    this.newProduit = {
      nomProd: produit.nomProd,
      description: produit.description,
      prix: produit.prix,
      quantiteStock: produit.quantiteStock,
      fournisseur: produit.fournisseur ? {
        idFour: produit.fournisseur.idFour,
        nom: produit.fournisseur.nom || '',
        prenom: produit.fournisseur.prenom || '',
        email: produit.fournisseur.email || '',
        telephone: produit.fournisseur.telephone,
        adresse: produit.fournisseur.adresse,
        entreprise: produit.fournisseur.entreprise || '',
        userId: produit.fournisseur.userId
      } : null
    };
  }

  saveProduit(): void {
    if (!this.newProduit.fournisseur || !this.newProduit.fournisseur.idFour) {
      alert('Veuillez sélectionner un fournisseur');
      return;
    }

    if (this.isFournisseur && 
        this.newProduit.fournisseur &&
        this.newProduit.fournisseur.idFour !== this.currentUser?.idFour) {
      alert('Vous ne pouvez créer des produits que pour votre entreprise');
      return;
    }

    if (this.isEditing && this.selectedProduit) {
      if (!this.canEditProduit(this.selectedProduit)) {
        alert('Vous n\'avez pas la permission de modifier ce produit');
        return;
      }

      this.produitService.updateProduit(this.selectedProduit.id!, this.newProduit)
        .subscribe({
          next: () => {
            console.log('✅ Produit modifié avec succès');
            alert('Produit modifié avec succès');
            this.loadProduits();
            this.hideForm();
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
            alert('Erreur lors de la modification du produit');
          }
        });
    } else {
      this.produitService.createProduit(this.newProduit)
        .subscribe({
          next: () => {
            console.log('✅ Produit créé avec succès');
            alert('Produit créé avec succès');
            this.loadProduits();
            this.hideForm();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            alert('Erreur lors de la création du produit');
          }
        });
    }
  }

  deleteProduit(id: number): void {
    const produit = this.produits.find(p => p.id === id);
    
    if (!produit || !this.canDeleteProduit(produit)) {
      alert('Vous n\'avez pas la permission de supprimer ce produit');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(id).subscribe({
        next: () => {
          console.log('✅ Produit supprimé avec succès');
          alert('Produit supprimé avec succès');
          this.loadProduits();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du produit');
        }
      });
    }
  }

  hideForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newProduit = {
      nomProd: '',
      description: '',
      prix: 0,
      quantiteStock: 0,
      fournisseur: null
    };
    
    if (this.isFournisseur && this.fournisseurs.length > 0) {
      this.newProduit.fournisseur = this.fournisseurs[0];
    }
    
    this.selectedProduit = null;
    this.isEditing = false;
  }

  getStockStatus(quantite: number): string {
    if (quantite === 0) return 'Rupture';
    if (quantite <= 5) return 'Stock faible';
    return 'En stock';
  }

  getStockClass(quantite: number): string {
    if (quantite === 0) return 'text-danger';
    if (quantite <= 5) return 'text-warning';
    return 'text-success';
  }

  // ✅ AJOUT: Méthode de comparaison pour le select
  compareFournisseurs(f1: Fournisseur | null, f2: Fournisseur | null): boolean {
    return f1 && f2 ? f1.idFour === f2.idFour : f1 === f2;
  }

  // ===== PERMISSIONS =====
  
  canAddProduit(): boolean {
    return this.isAdmin || this.isFournisseur;
  }

  canEditProduit(produit: Produit): boolean {
    if (this.isAdmin) {
      return true;
    }
    
    if (this.isFournisseur && this.currentUser?.idFour) {
      return produit.fournisseur !== null && 
             produit.fournisseur.idFour === this.currentUser.idFour;
    }
    
    return false;
  }

  canDeleteProduit(produit: Produit): boolean {
    if (this.isAdmin) {
      return true;
    }
    
    if (this.isFournisseur && this.currentUser?.idFour) {
      return produit.fournisseur !== null && 
             produit.fournisseur.idFour === this.currentUser.idFour;
    }
    
    return false;
  }
}