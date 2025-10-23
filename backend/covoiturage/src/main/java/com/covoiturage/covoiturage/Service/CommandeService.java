package com.covoiturage.covoiturage.Service;


import com.covoiturage.covoiturage.Entite.*;
import com.covoiturage.covoiturage.dto.CommandeDTO;
import com.covoiturage.covoiturage.repository.ClientRepository;
import com.covoiturage.covoiturage.repository.CommandeRepository;
import com.covoiturage.covoiturage.repository.LigneCMDRepository;
import com.covoiturage.covoiturage.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommandeService {

    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private LigneCMDRepository ligneCMDRepository;

    @Autowired
    private ProduitService produitService;

    public List<Commande> getAllCommandes() {
        return commandeRepository.findAll();
    }

    public Optional<Commande> getCommandeById(Long id) {
        return commandeRepository.findById(id);
    }

    public List<Commande> getCommandesByClient(Long clientId) {
        return commandeRepository.findByClientIdClient(clientId);
    }

    @Transactional
    public Commande createCommande(CommandeDTO commandeDTO) {
        // Vérifier que le client existe
        Optional<Client> optionalClient = clientRepository.findById(commandeDTO.getClientId());
        if (!optionalClient.isPresent()) {
            throw new RuntimeException("Client not found");
        }

        Commande commande = new Commande();
        commande.setClient(optionalClient.get());
        commande.setDateCMD(LocalDateTime.now());
        commande.setStatus(StatusCommande.EN_COURS);

        // Sauvegarder la commande d'abord
        commande = commandeRepository.save(commande);

        BigDecimal montantTotal = BigDecimal.ZERO;

        // Traiter chaque ligne de commande
        for (CommandeDTO.LigneCommandeDTO ligneDTO : commandeDTO.getLignesCommande()) {
            Optional<Produit> optionalProduit = produitRepository.findById(ligneDTO.getProduitId());
            if (!optionalProduit.isPresent()) {
                throw new RuntimeException("Product not found: " + ligneDTO.getProduitId());
            }

            Produit produit = optionalProduit.get();

            // Vérifier le stock
            if (produit.getQuantiteStock() < ligneDTO.getQuantite()) {
                throw new RuntimeException("Stock insuffisant pour le produit: " + produit.getNomProd());
            }

            LigneCMD ligneCMD = new LigneCMD();
            ligneCMD.setCommande(commande);
            ligneCMD.setProduit(produit);
            ligneCMD.setQuantite(ligneDTO.getQuantite());
            ligneCMD.setPrixUnitaire(produit.getPrix());
            ligneCMD.calculerSousTotal();

            ligneCMDRepository.save(ligneCMD);
            montantTotal = montantTotal.add(ligneCMD.getSousTotal());
        }

        commande.setMontantTotal(montantTotal);
        return commandeRepository.save(commande);
    }

    @Transactional
    public Commande confirmerCommande(Long commandeId) {
        Optional<Commande> optionalCommande = commandeRepository.findById(commandeId);
        if (!optionalCommande.isPresent()) {
            throw new RuntimeException("Commande not found");
        }

        Commande commande = optionalCommande.get();
        if (commande.getStatus() != StatusCommande.EN_COURS) {
            throw new RuntimeException("Seules les commandes en cours peuvent être confirmées");
        }

        // Mettre à jour les stocks
        for (LigneCMD ligne : commande.getLignesCommande()) {
            if (!produitService.updateStock(ligne.getProduit().getId(), ligne.getQuantite())) {
                throw new RuntimeException("Impossible de mettre à jour le stock pour le produit: " +
                        ligne.getProduit().getNomProd());
            }
        }

        commande.setStatus(StatusCommande.CONFIRMEE);
        return commandeRepository.save(commande);
    }

    public Commande updateStatusCommande(Long commandeId, StatusCommande nouveauStatus) {
        Optional<Commande> optionalCommande = commandeRepository.findById(commandeId);
        if (!optionalCommande.isPresent()) {
            throw new RuntimeException("Commande not found");
        }

        Commande commande = optionalCommande.get();
        commande.setStatus(nouveauStatus);
        return commandeRepository.save(commande);
    }

    public void deleteCommande(Long id) {
        commandeRepository.deleteById(id);
    }
}