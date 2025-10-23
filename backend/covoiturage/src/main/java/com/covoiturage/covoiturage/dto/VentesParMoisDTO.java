package com.covoiturage.covoiturage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class VentesParMoisDTO {
    private String mois;
    private BigDecimal montantTotal;

}

