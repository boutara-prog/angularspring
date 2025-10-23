package com.covoiturage.covoiturage.dto;

import com.covoiturage.covoiturage.Entite.ModePaiement;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaiementRequest {
    private Long commandeId;
    private ModePaiement modePaiement;
    private BigDecimal montant;
}