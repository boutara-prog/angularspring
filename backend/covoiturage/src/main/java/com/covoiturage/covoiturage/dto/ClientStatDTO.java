package com.covoiturage.covoiturage.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClientStatDTO {
    private String nomClient;
    private String prenomClient;
    private Long nombreCommandes;
    private BigDecimal montantTotal;
}