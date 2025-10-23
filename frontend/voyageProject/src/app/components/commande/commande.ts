import { Component, OnInit } from '@angular/core';
import { Commande, StatusCommande } from '../../models/commande.model';
import { Client } from '../../models/client.model';
import { Produit } from '../../models/produit.model';
import { LigneCMD } from '../../models/ligne-cmd.model';
import { CommandeDTO } from '../../models/commande.dto';
import { CommandeService } from '../../services/commande.service';
import { ClientService } from '../../services/client.service';
import { ProduitService } from '../../services/produit.service';
import { LigneCMDService } from '../../services/ligne-cmd.service';
import { StockService } from '../../services/stock.service';
import { AuthService } from '../../services/AuthService.service';
import { PanierService, PanierItem } from '../../services/panier.service';
import { forkJoin } from 'rxjs';

interface LigneCommandeForm {
  produit: Produit | null;
  quantite: number;
  sousTotal: number;
}

@Component({
  selector: 'app-commande',
  standalone: false,
  templateUrl: './commande.html',
  styleUrl: './commande.scss'
})
export class commande implements OnInit {
  commandes: Commande[] = [];
  clients: Client[] = [];
  produits: Produit[] = [];
  
  // Utilisateur connecté
  currentUser: any = null;
  userRole: string = '';
  isClient: boolean = false;
  isAdmin: boolean = false;
  
  // Panier (pour les CLIENTS)
  panierItems: PanierItem[] = [];
  totalPanier: number = 0;
  
  // Formulaire de création de commande (pour ADMIN)
  showForm = false;
  selectedClient: Client | null = null;
  lignesCommande: LigneCommandeForm[] = [];
  totalCommande = 0;

  // Popup pour afficher les détails
  showDetailsModal = false;
  selectedCommande: Commande | null = null;
  lignesCommandeDetails: LigneCMD[] = [];

  // Gestion des statuts
  statusCommande = StatusCommande;
  statusOptions = [
    { value: StatusCommande.EN_COURS, label: 'En cours' },
    { value: StatusCommande.CONFIRMEE, label: 'Confirmée' },
    { value: StatusCommande.PAYEE, label: 'Payée' },
    { value: StatusCommande.EXPEDIEE, label: 'Expédiée' },
    { value: StatusCommande.LIVREE, label: 'Livrée' },
    { value: StatusCommande.ANNULEE, label: 'Annulée' }
  ];

  constructor(
    private commandeService: CommandeService,
    private clientService: ClientService,
    private produitService: ProduitService,
    private authService: AuthService,
    private panierService: PanierService,
    private ligneCMDService: LigneCMDService,
    private stockService: StockService
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadCommandes();
    
    if (this.isAdmin) {
      this.loadClients();
      this.loadProduits();
    }
    
    if (this.isClient) {
      this.loadPanier();
      
      this.panierService.panier$.subscribe(() => {
        this.loadPanier();
      });
    }
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      const role = (this.currentUser.userRole || this.currentUser.role || '').toUpperCase();
      this.userRole = role;
      this.isClient = role === 'CLIENT';
      this.isAdmin = role === 'ADMIN';
      
      console.log('🔐 User Role:', this.userRole);
      console.log('✅ IsClient:', this.isClient);
      console.log('✅ IsAdmin:', this.isAdmin);
    }
  }

  loadCommandes(): void {
    if (this.isClient && this.currentUser?.idClient) {
      this.commandeService.getCommandesByClient(this.currentUser.idClient).subscribe({
        next: (data) => {
          console.log('🛒 Commandes du client:', data);
          this.commandes = data;
        },
        error: (error) => console.error('Erreur lors du chargement des commandes:', error)
      });
    } else if (this.isAdmin) {
      this.commandeService.getAllCommandes().subscribe({
        next: (data) => {
          console.log('👑 Toutes les commandes:', data);
          this.commandes = data;
        },
        error: (error) => console.error('Erreur lors du chargement des commandes:', error)
      });
    }
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => this.clients = data,
      error: (error) => console.error('Erreur lors du chargement des clients:', error)
    });
  }

  loadProduits(): void {
    this.produitService.getAllProduits().subscribe({
      next: (data) => this.produits = data,
      error: (error) => console.error('Erreur lors du chargement des produits:', error)
    });
  }

  // ===== GESTION DU PANIER (CLIENTS) =====

  loadPanier(): void {
    this.panierItems = this.panierService.getPanier();
    this.totalPanier = this.panierService.getTotalPanier();
    console.log('🛒 Panier chargé:', this.panierItems);
  }

  updateQuantitePanier(produitId: number, quantite: number): void {
    this.panierService.modifierQuantite(produitId, quantite);
  }

  retirerDuPanier(produitId: number): void {
    if (confirm('Voulez-vous retirer ce produit du panier ?')) {
      this.panierService.retirerDuPanier(produitId);
    }
  }

  viderPanier(): void {
    if (confirm('Voulez-vous vider tout le panier ?')) {
      this.panierService.viderPanier();
    }
  }

  creerCommandeDepuisPanier(): void {
    if (!this.isClient || this.panierItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    const clientId = this.currentUser?.idClient;
    
    if (!clientId) {
      alert('Erreur : Client non identifié');
      return;
    }

    const commandeDTO: CommandeDTO = {
      clientId: clientId,
      lignesCommande: this.panierItems.map(item => ({
        produitId: item.produit.id!,
        quantite: item.quantite
      }))
    };

    this.commandeService.createCommande(commandeDTO).subscribe({
      next: (commande) => {
        console.log('✅ Commande créée:', commande);
        alert('Commande créée avec succès !');
        
        this.panierService.viderPanier();
        this.loadPanier();
        this.loadCommandes();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la commande:', error);
        alert('Erreur lors de la création de la commande.');
      }
    });
  }

  // ===== AFFICHAGE DES DÉTAILS =====

  showCommandeDetails(commande: Commande): void {
    this.selectedCommande = commande;
    this.showDetailsModal = true;
    
    this.ligneCMDService.getLignesCommandeByCommande(commande.id!).subscribe({
      next: (lignes) => {
        console.log('📋 Lignes de commande:', lignes);
        this.lignesCommandeDetails = lignes;
      },
      error: (error) => {
        console.error('❌ Erreur chargement lignes:', error);
        alert('Erreur lors du chargement des détails');
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedCommande = null;
    this.lignesCommandeDetails = [];
  }

  // ===== GESTION FORMULAIRE (ADMIN) =====

  showCreateForm(): void {
    if (!this.isAdmin) return;
    this.showForm = true;
    this.resetForm();
  }

  hideForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.selectedClient = null;
    this.lignesCommande = [];
    this.totalCommande = 0;
    this.addLigneCommande();
  }

  addLigneCommande(): void {
    this.lignesCommande.push({
      produit: null,
      quantite: 1,
      sousTotal: 0
    });
  }

  removeLigneCommande(index: number): void {
    this.lignesCommande.splice(index, 1);
    this.calculateTotal();
  }

  onProduitChange(index: number): void {
    const ligne = this.lignesCommande[index];
    if (ligne.produit) {
      ligne.sousTotal = ligne.produit.prix * ligne.quantite;
    } else {
      ligne.sousTotal = 0;
    }
    this.calculateTotal();
  }

  onQuantiteChange(index: number): void {
    const ligne = this.lignesCommande[index];
    if (ligne.produit && ligne.quantite > 0) {
      ligne.sousTotal = ligne.produit.prix * ligne.quantite;
    } else {
      ligne.sousTotal = 0;
    }
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalCommande = this.lignesCommande.reduce((total, ligne) => total + ligne.sousTotal, 0);
  }

  createCommande(): void {
    if (!this.selectedClient || this.lignesCommande.length === 0) {
      alert('Veuillez sélectionner un client et ajouter au moins une ligne de commande.');
      return;
    }

    const validLignes = this.lignesCommande.filter(ligne => 
      ligne.produit && ligne.quantite > 0
    );

    if (validLignes.length === 0) {
      alert('Veuillez ajouter au moins une ligne de commande valide.');
      return;
    }

    const commandeDTO: CommandeDTO = {
      clientId: this.selectedClient.id!,
      lignesCommande: validLignes.map(ligne => ({
        produitId: ligne.produit!.id!,
        quantite: ligne.quantite
      }))
    };

    this.commandeService.createCommande(commandeDTO).subscribe({
      next: (commande) => {
        console.log('✅ Commande créée:', commande);
        this.loadCommandes();
        this.hideForm();
        alert('Commande créée avec succès !');
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la commande:', error);
        alert('Erreur lors de la création de la commande.');
      }
    });
  }

  // ===== GESTION DES COMMANDES =====

  confirmerCommande(id: number): void {
    this.commandeService.confirmerCommande(id).subscribe({
      next: () => {
        this.loadCommandes();
        alert('Commande confirmée !');
      },
      error: (error) => {
        console.error('Erreur lors de la confirmation:', error);
        alert('Erreur lors de la confirmation.');
      }
    });
  }

  /**
   * ✅ MISE À JOUR DU STATUT AVEC DIMINUTION DE STOCK
   */
  
  updateStatus(commande: Commande, newStatus: StatusCommande): void {
    const oldStatus = commande.status;

    // Si passage à PAYEE ou LIVREE, on diminue le stock
    const shouldDecrementStock = 
      (newStatus === StatusCommande.PAYEE || newStatus === StatusCommande.LIVREE) &&
      oldStatus !== StatusCommande.PAYEE && 
      oldStatus !== StatusCommande.LIVREE;

    if (shouldDecrementStock) {
      // Charger les lignes de commande pour connaître les quantités
      this.ligneCMDService.getLignesCommandeByCommande(commande.id!).subscribe({
        next: (lignes) => {
          this.updateStatusAndDecrementStock(commande.id!, newStatus, lignes);
        },
        error: (error) => {
          console.error('❌ Erreur chargement lignes:', error);
          alert('Erreur lors du chargement des lignes de commande');
        }
      });
    } else {
      // Mise à jour simple du statut
      this.commandeService.updateStatusCommande(commande.id!, newStatus).subscribe({
        next: () => {
          this.loadCommandes();
          alert(`Statut mis à jour : ${this.getStatusLabel(newStatus)}`);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du statut:', error);
          alert('Erreur lors de la mise à jour du statut.');
        }
      });
    }
  }

  /**
   * ✅ NOUVELLE MÉTHODE : Met à jour le statut ET diminue le stock
   */
  private updateStatusAndDecrementStock(
    commandeId: number, 
    newStatus: StatusCommande, 
    lignes: LigneCMD[]
  ): void {
    if (lignes.length === 0) {
      alert('Aucun produit dans cette commande');
      return;
    }

    // Créer les requêtes de diminution pour chaque produit
    const decrementRequests = lignes.map(ligne => {
      const produitId = ligne.produit?.id;
      if (!produitId) {
        console.warn('⚠️ Ligne sans produit ID:', ligne);
        return null;
      }
      
      console.log(`📦 Diminution stock: Produit ${produitId}, Quantité: ${ligne.quantite}`);
      
      // On diminue à la fois dans Stock et dans Produit
      return forkJoin({
        stock: this.stockService.diminuerQuantite(produitId, ligne.quantite)
      });
    }).filter(req => req !== null);

    if (decrementRequests.length === 0) {
      alert('Impossible de diminuer le stock : produits introuvables');
      return;
    }

    // Exécuter toutes les diminutions en parallèle
    forkJoin(decrementRequests).subscribe({
      next: (results) => {
        console.log('✅ Stocks diminués:', results);
        
        // Mettre à jour le statut de la commande
        this.commandeService.updateStatusCommande(commandeId, newStatus).subscribe({
          next: () => {
            this.loadCommandes();
            this.loadProduits(); // Recharger les produits pour avoir les nouvelles quantités
            alert(`✅ Commande ${this.getStatusLabel(newStatus)} et stocks mis à jour !`);
          },
          error: (error) => {
            console.error('❌ Erreur mise à jour statut:', error);
            alert('Les stocks ont été diminués mais erreur lors de la mise à jour du statut');
          }
        });
      },
      error: (error) => {
        console.error('❌ Erreur diminution stock:', error);
        alert('Erreur lors de la diminution du stock. Vérifiez les quantités disponibles.');
      }
    });
  }

  deleteCommande(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.commandeService.deleteCommande(id).subscribe({
        next: () => {
          this.loadCommandes();
          alert('Commande supprimée');
        },
        error: (error) => console.error('Erreur lors de la suppression:', error)
      });
    }
  }

  getStatusBadgeClass(status: StatusCommande): string {
    switch (status) {
      case StatusCommande.EN_COURS: return 'badge bg-secondary';
      case StatusCommande.CONFIRMEE: return 'badge bg-primary';
      case StatusCommande.PAYEE: return 'badge bg-success';
      case StatusCommande.EXPEDIEE: return 'badge bg-info';
      case StatusCommande.LIVREE: return 'badge bg-success';
      case StatusCommande.ANNULEE: return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getStatusLabel(status: StatusCommande): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.label : status;
  }
}