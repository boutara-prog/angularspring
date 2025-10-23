package com.covoiturage.covoiturage.repository;


import com.covoiturage.covoiturage.Entite.Paiement;
import com.covoiturage.covoiturage.Entite.StatusPaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    Optional<Paiement> findByCommandeId(Long commandeId);
    List<Paiement> findByStatusPaiement(StatusPaiement status);
}
