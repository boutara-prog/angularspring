export interface StatistiquesDTO {
  totalCommandes: number;
  chiffreAffairesMensuel: number;
  totalProduits: number;
  totalClients: number;
}

export interface ProductStatDTO {
  produitId: number;
  nomProduit: string;
  quantiteVendue: number;
  montantTotal: number;
}

export interface ClientStatDTO {
  clientId: number;
  nomClient: string;
  prenomClient: string;
  nombreCommandes: number;
  montantTotal: number;
}

export interface VentesMensuellesDTO {
  mois: number;
  annee: number;
  montantTotal: number;
  nombreCommandes: number;
}