package com.covoiturage.covoiturage.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VentesMensuellesDTO {
    private Integer mois;
    private Integer annee;
    private BigDecimal montantTotal;
    private Long nombreCommandes;
}
