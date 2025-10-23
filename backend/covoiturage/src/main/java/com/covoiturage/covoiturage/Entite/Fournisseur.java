package com.covoiturage.covoiturage.Entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "fournisseurs")
public class Fournisseur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idFour;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;
    // Relation avec l'utilisateur
    @Column(name = "user_id")
    private Long userId;  // Lien vers l'utilisateur
    private String entreprise;
    private String email;
    private String telephone;
    private String adresse;

    @OneToMany(mappedBy = "fournisseur", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Produit> produits;
}