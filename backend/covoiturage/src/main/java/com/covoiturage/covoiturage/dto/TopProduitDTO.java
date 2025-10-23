package com.covoiturage.covoiturage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopProduitDTO {
    private Long produitId;
    private String nomProduit;
    private String fournisseur;
    private Long quantiteVendue;
}
