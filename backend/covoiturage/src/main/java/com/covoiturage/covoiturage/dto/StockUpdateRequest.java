package com.covoiturage.covoiturage.dto;

import lombok.Data;

@Data
public class StockUpdateRequest {
    private Long produitId;
    private Integer quantite;
    private Integer seuilMin;
}