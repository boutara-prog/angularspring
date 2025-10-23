package com.covoiturage.covoiturage.repository;

import com.covoiturage.covoiturage.Entite.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FournisseurRepository extends JpaRepository<Fournisseur, Long> {
    List<Fournisseur> findByNomContainingIgnoreCase(String nom);
    List<Fournisseur> findByEntrepriseContainingIgnoreCase(String entreprise);
    Optional<Fournisseur> findByEmail(String email);
}

