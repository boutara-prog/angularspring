package com.covoiturage.covoiturage.controller;



import com.covoiturage.covoiturage.Entite.Fournisseur;
import com.covoiturage.covoiturage.Service.FournisseurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/fournisseurs")
@CrossOrigin(origins = "http://localhost:4200")
public class FournisseurController {

    @Autowired
    private FournisseurService fournisseurService;

    @GetMapping
    public List<Fournisseur> getAllFournisseurs() {
        return fournisseurService.getAllFournisseurs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fournisseur> getFournisseurById(@PathVariable Long id) {
        Optional<Fournisseur> fournisseur = fournisseurService.getFournisseurById(id);
        return fournisseur.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Fournisseur createFournisseur(@RequestBody Fournisseur fournisseur) {
        return fournisseurService.saveFournisseur(fournisseur);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fournisseur> updateFournisseur(@PathVariable Long id,
                                                         @RequestBody Fournisseur fournisseurDetails) {
        Optional<Fournisseur> optionalFournisseur = fournisseurService.getFournisseurById(id);
        if (optionalFournisseur.isPresent()) {
            Fournisseur fournisseur = optionalFournisseur.get();
            fournisseur.setNom(fournisseurDetails.getNom());
            fournisseur.setPrenom(fournisseurDetails.getPrenom());
            fournisseur.setEmail(fournisseurDetails.getEmail());
            fournisseur.setTelephone(fournisseurDetails.getTelephone());
            fournisseur.setAdresse(fournisseurDetails.getAdresse());
            fournisseur.setEntreprise(fournisseurDetails.getEntreprise());
            return ResponseEntity.ok(fournisseurService.saveFournisseur(fournisseur));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFournisseur(@PathVariable Long id) {
        if (fournisseurService.getFournisseurById(id).isPresent()) {
            fournisseurService.deleteFournisseur(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }


}