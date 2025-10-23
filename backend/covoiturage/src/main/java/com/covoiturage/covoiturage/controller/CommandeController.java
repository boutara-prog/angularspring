package com.covoiturage.covoiturage.controller;


import com.covoiturage.covoiturage.Entite.Commande;
import com.covoiturage.covoiturage.Entite.StatusCommande;
import com.covoiturage.covoiturage.Service.CommandeService;
import com.covoiturage.covoiturage.dto.CommandeDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/commandes")
@CrossOrigin(origins = "http://localhost:4200")
public class CommandeController {

    @Autowired
    private CommandeService commandeService;

    @GetMapping
    public List<Commande> getAllCommandes() {
        return commandeService.getAllCommandes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Commande> getCommandeById(@PathVariable Long id) {
        Optional<Commande> commande = commandeService.getCommandeById(id);
        return commande.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Commande> createCommande(@RequestBody CommandeDTO commandeDTO) {
        try {
            Commande commande = commandeService.createCommande(commandeDTO);
            return ResponseEntity.ok(commande);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/confirmer")
    public ResponseEntity<Commande> confirmerCommande(@PathVariable Long id) {
        try {
            Commande commande = commandeService.confirmerCommande(id);
            return ResponseEntity.ok(commande);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Commande> updateStatusCommande(@PathVariable Long id,
                                                         @RequestBody StatusCommande status) {
        try {
            Commande commande = commandeService.updateStatusCommande(id, status);
            return ResponseEntity.ok(commande);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCommande(@PathVariable Long id) {
        if (commandeService.getCommandeById(id).isPresent()) {
            commandeService.deleteCommande(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // EndPoint pour récupérer toutes les commandes d'un client
    @GetMapping("/client/{clientId}")
    public List<Commande> getCommandesByClient(@PathVariable Long clientId) {
        return commandeService.getCommandesByClient(clientId);
    }
}
