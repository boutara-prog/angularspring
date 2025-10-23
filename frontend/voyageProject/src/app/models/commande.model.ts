import  { Client } from './client.model';
import  { LigneCMD } from './ligne-cmd.model';

export enum StatusCommande {
  EN_COURS = 'EN_COURS',
  CONFIRMEE = 'CONFIRMEE',
  PAYEE = 'PAYEE',
  EXPEDIEE = 'EXPEDIEE',
  LIVREE = 'LIVREE',
  ANNULEE = 'ANNULEE'
}

export interface Commande {
  id?: number;
  dateCMD: Date;
  montantTotal: number;
  status: StatusCommande;
    client: Client | null;  // ✅ Permettre null si le client peut être absent

  lignesCommande?: LigneCMD[];
}