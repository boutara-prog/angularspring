package com.covoiturage.covoiturage.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductStatDTO {
    private String nomProduit;
    private Long quantiteVendue;
    private BigDecimal montantTotal;
}