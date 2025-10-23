package com.covoiturage.covoiturage.dto;


import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CommandeDTO {
    private Long clientId;
    private List<LigneCommandeDTO> lignesCommande;

    @Data
    public static class LigneCommandeDTO {
        private Long produitId;
        private Integer quantite;
    }
}