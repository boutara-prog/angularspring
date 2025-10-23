package com.covoiturage.covoiturage.controller;


import com.covoiturage.covoiturage.Entite.Paiement;
import com.covoiturage.covoiturage.Entite.StatusPaiement;
import com.covoiturage.covoiturage.Service.PaiementService;
import com.covoiturage.covoiturage.dto.PaiementRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/paiements")
@CrossOrigin(origins = "http://localhost:4200")
public class PaiementController {

    @Autowired
    private PaiementService paiementService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Paiement> getAllPaiements() {
        return paiementService.getAllPaiements();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Paiement> getPaiementById(@PathVariable Long id) {
        Optional<Paiement> paiement = paiementService.getPaiementById(id);
        return paiement.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/commande/{commandeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Paiement> getPaiementByCommande(@PathVariable Long commandeId) {
        Optional<Paiement> paiement = paiementService.getPaiementByCommande(commandeId);
        return paiement.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Paiement> createPaiement(@RequestBody PaiementRequest request) {
        try {
            Paiement paiement = paiementService.createPaiement(request);
            return ResponseEntity.ok(paiement);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Paiement> validerPaiement(@PathVariable Long id) {
        try {
            Paiement paiement = paiementService.validerPaiement(id);
            return ResponseEntity.ok(paiement);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/refuser")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Paiement> refuserPaiement(@PathVariable Long id) {
        try {
            Paiement paiement = paiementService.refuserPaiement(id);
            return ResponseEntity.ok(paiement);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Paiement> getPaiementsByStatus(@PathVariable StatusPaiement status) {
        return paiementService.getPaiementsByStatus(status);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePaiement(@PathVariable Long id) {
        if (paiementService.getPaiementById(id).isPresent()) {
            paiementService.deletePaiement(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}