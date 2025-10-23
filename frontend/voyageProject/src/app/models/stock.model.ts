import  { Produit } from './produit.model';
export interface Stock {
  id?: number;
  produit: Produit;
  quantiteStock: number;
  quantiteMinimale: number;
  localisation: string;
  dateMiseAJour: Date;
  statut: StatutStock;
}
export enum StatutStock {
  EN_STOCK = 'EN_STOCK',
  EN_RUPTURE = 'EN_RUPTURE',
  EN_COMMANDE = 'EN_COMMANDE'
}

