import { Component, OnInit } from '@angular/core';
import { StockService } from '../../services/stock.service';
import { Stock, StatutStock } from '../../models/stock.model';

@Component({
  selector: 'app-stock-list',
  standalone: false,
  templateUrl: './stock-list.html',
  styleUrl: './stock-list.scss'
})
export class StockList implements OnInit {

  stocks: Stock[] = [];
  loading: boolean = false;
  error: string = '';
  searchText: string = '';
  showOnlyRupture: boolean = false;

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.loadStocks();
  }

  /**
   * Charger tous les stocks
   */
  loadStocks(): void {
    this.loading = true;
    this.error = '';

    this.stockService.getAllStocks().subscribe({
      next: (data) => {
        this.stocks = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des stocks';
        console.error(err);
        this.loading = false;
      }
    });
  }

  /**
   * Charger les produits en rupture
   */
  loadProduitsEnRupture(): void {
    this.loading = true;
    this.error = '';

    this.stockService.getProduitsEnRupture().subscribe({
      next: (data) => {
        this.stocks = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des ruptures';
        console.error(err);
        this.loading = false;
      }
    });
  }

  /**
   * Filtrer les stocks
   */
  getFilteredStocks(): Stock[] {
    let filtered = this.stocks;

    if (this.searchText) {
      filtered = filtered.filter(s =>
        s.produit.nomProd.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    if (this.showOnlyRupture) {
      filtered = filtered.filter(s =>
        s.statut === StatutStock.EN_RUPTURE || s.statut === StatutStock.EN_COMMANDE
      );
    }

    return filtered;
  }

  /**
   * Obtenir la classe CSS du badge de statut
   */
  getStatusBadgeClass(statut: StatutStock): string {
    const baseClass = 'badge';
    switch (statut) {
      case StatutStock.EN_STOCK:
        return `${baseClass} bg-success`;
      case StatutStock.EN_RUPTURE:
        return `${baseClass} bg-danger`;
      case StatutStock.EN_COMMANDE:
        return `${baseClass} bg-warning`;
      default:
        return baseClass;
    }
  }

  /**
   * Obtenir le label du statut
   */
  getStatusLabel(statut: StatutStock): string {
    const labels: { [key in StatutStock]: string } = {
      [StatutStock.EN_STOCK]: 'En Stock',
      [StatutStock.EN_RUPTURE]: 'En Rupture',
      [StatutStock.EN_COMMANDE]: 'En Commande'
    };
    return labels[statut] || 'Inconnu';
  }

  /**
   * Supprimer un stock
   */
  deleteStock(id: number | undefined): void {
    if (!id) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) {
      this.stockService.deleteStock(id).subscribe({
        next: () => {
          this.stocks = this.stocks.filter(s => s.id !== id);
          alert('Stock supprimé avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
          console.error(err);
        }
      });
    }
  }
}
