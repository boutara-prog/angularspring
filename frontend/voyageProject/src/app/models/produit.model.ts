import  { Fournisseur } from './fournisseur.model';
export interface Produit {
  id?: number;
  nomProd: string;

  description: string;
  prix: number;
  quantiteStock: number;
    fournisseur: Fournisseur | null;  // ✅ Permettre null

    selectedQuantite?: number;

}