package com.covoiturage.covoiturage.controller;


import com.covoiturage.covoiturage.Entite.LigneCMD;
import com.covoiturage.covoiturage.Service.LigneCMDService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lignes-commande")
@CrossOrigin(origins = "http://localhost:4200")
public class LigneCMDController {

    @Autowired
    private LigneCMDService ligneCMDService;

    @GetMapping
    public List<LigneCMD> getAllLignesCommande() {
        return ligneCMDService.getAllLignesCommande();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LigneCMD> getLigneCommandeById(@PathVariable Long id) {
        Optional<LigneCMD> ligneCMD = ligneCMDService.getLigneCommandeById(id);
        return ligneCMD.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LigneCMD createLigneCommande(@RequestBody LigneCMD ligneCMD) {
        return ligneCMDService.saveLigneCommande(ligneCMD);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLigneCommande(@PathVariable Long id) {
        if (ligneCMDService.getLigneCommandeById(id).isPresent()) {
            ligneCMDService.deleteLigneCommande(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // EndPoint pour récupérer les lignes de commandes par id de commande
    @GetMapping("/commande/{commandeId}")
    public List<LigneCMD> getLignesCommandeByCommande(@PathVariable Long commandeId) {
        return ligneCMDService.getLignesCommandeByCommande(commandeId);
    }
}