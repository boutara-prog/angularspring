package com.covoiturage.covoiturage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class TopClientDTO {
    private Long clientId;
    private String nom;
    private String prenom;
    private Long nombreCommandes;
    private BigDecimal montantTotal;
}
