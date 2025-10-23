
import  { Produit } from './produit.model';
import  { Commande } from './commande.model';

export interface LigneCMD {
  id?: number;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;  // ✅ AJOUTEZ CE CHAMP
    produit: Produit | null;  // ✅ Permettre null
  commande?: Commande;
}