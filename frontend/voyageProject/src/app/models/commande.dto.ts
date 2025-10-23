export interface CommandeDTO {
  clientId: number;
  lignesCommande: {
    produitId: number;
    quantite: number;
  }[];
}