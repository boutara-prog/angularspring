import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Produit } from '../models/produit.model';

export interface PanierItem {
  produit: Produit;
  quantite: number;
  sousTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private panierItems = new BehaviorSubject<PanierItem[]>([]);
  public panier$ = this.panierItems.asObservable();

  constructor() {
    // Charger le panier depuis localStorage au démarrage
    this.loadPanierFromStorage();
  }

  private loadPanierFromStorage(): void {
    // Utiliser sessionStorage au lieu de localStorage pour stocker en mémoire
    const savedPanier = sessionStorage.getItem('panier');
    if (savedPanier) {
      this.panierItems.next(JSON.parse(savedPanier));
    }
  }

  private savePanierToStorage(): void {
    sessionStorage.setItem('panier', JSON.stringify(this.panierItems.value));
  }

  getPanier(): PanierItem[] {
    return this.panierItems.value;
  }

  ajouterAuPanier(produit: Produit, quantite: number = 1): void {
    const items = this.panierItems.value;
    const existingItem = items.find(item => item.produit.id === produit.id);

    if (existingItem) {
      existingItem.quantite += quantite;
      existingItem.sousTotal = existingItem.produit.prix * existingItem.quantite;
    } else {
      items.push({
        produit,
        quantite,
        sousTotal: produit.prix * quantite
      });
    }

    this.panierItems.next(items);
    this.savePanierToStorage();
  }

  modifierQuantite(produitId: number, quantite: number): void {
    const items = this.panierItems.value;
    const item = items.find(i => i.produit.id === produitId);
    
    if (item && quantite > 0) {
      item.quantite = quantite;
      item.sousTotal = item.produit.prix * quantite;
      this.panierItems.next(items);
      this.savePanierToStorage();
    }
  }

  retirerDuPanier(produitId: number): void {
    const items = this.panierItems.value.filter(item => item.produit.id !== produitId);
    this.panierItems.next(items);
    this.savePanierToStorage();
  }

  viderPanier(): void {
    this.panierItems.next([]);
    localStorage.removeItem('panier');
  }

  getTotalPanier(): number {
    return this.panierItems.value.reduce((total, item) => total + item.sousTotal, 0);
  }

  getNombreArticles(): number {
    return this.panierItems.value.reduce((total, item) => total + item.quantite, 0);
  }
}