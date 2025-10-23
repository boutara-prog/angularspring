package com.covoiturage.covoiturage.Service;

import com.covoiturage.covoiturage.Entite.Commande;
import com.covoiturage.covoiturage.Entite.Paiement;
import com.covoiturage.covoiturage.Entite.StatusPaiement;
import com.covoiturage.covoiturage.dto.PaiementRequest;
import com.covoiturage.covoiturage.repository.CommandeRepository;
import com.covoiturage.covoiturage.repository.PaiementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaiementService {

    @Autowired
    private PaiementRepository paiementRepository;

    @Autowired
    private CommandeRepository commandeRepository;

    public List<Paiement> getAllPaiements() {
        return paiementRepository.findAll();
    }

    public Optional<Paiement> getPaiementById(Long id) {
        return paiementRepository.findById(id);
    }

    public Optional<Paiement> getPaiementByCommande(Long commandeId) {
        return paiementRepository.findByCommandeId(commandeId);
    }

    public Paiement createPaiement(PaiementRequest request) {
        Commande commande = commandeRepository.findById(request.getCommandeId())
                .orElseThrow(() -> new RuntimeException("Commande not found"));

        if (paiementRepository.findByCommandeId(request.getCommandeId()).isPresent()) {
            throw new RuntimeException("Payment already exists for this order");
        }

        Paiement paiement = new Paiement();
        paiement.setCommande(commande);
        paiement.setMontant(commande.getMontantTotal());
        paiement.setModePaiement(request.getModePaiement());
        paiement.setStatusPaiement(StatusPaiement.EN_ATTENTE);
        paiement.setReferenceTransaction(generateTransactionReference());

        return paiementRepository.save(paiement);
    }

    public Paiement validerPaiement(Long paiementId) {
        Paiement paiement = paiementRepository.findById(paiementId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        paiement.setStatusPaiement(StatusPaiement.VALIDE);
        paiement.setDatePaiement(LocalDateTime.now());

        return paiementRepository.save(paiement);
    }

    public Paiement refuserPaiement(Long paiementId) {
        Paiement paiement = paiementRepository.findById(paiementId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        paiement.setStatusPaiement(StatusPaiement.REFUSE);
        return paiementRepository.save(paiement);
    }

    public List<Paiement> getPaiementsByStatus(StatusPaiement status) {
        return paiementRepository.findByStatusPaiement(status);
    }

    private String generateTransactionReference() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public void deletePaiement(Long id) {
        paiementRepository.deleteById(id);
    }
}