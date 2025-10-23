package com.covoiturage.covoiturage.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatistiquesDTO {
    private Long totalClients;
    private Long totalProduits;
    private Long totalCommandes;
    private BigDecimal chiffreAffairesMensuel;
    private Long produitsEnRupture;
}