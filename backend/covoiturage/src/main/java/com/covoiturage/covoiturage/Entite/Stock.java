package com.covoiturage.covoiturage.Entite;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "stocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "produit_id", unique = true)
    private Produit produit;

    @Column(nullable = true)
    private Integer quantiteStock = 0;

    private Integer seuilMin = 5;

    @Column(name = "derniere_maj")
    private LocalDateTime derniereMaj = LocalDateTime.now();

    public boolean isEnRupture() {
        return quantiteStock <= seuilMin;
    }
}