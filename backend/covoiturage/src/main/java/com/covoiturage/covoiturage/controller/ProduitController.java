package com.covoiturage.covoiturage.controller;

import com.covoiturage.covoiturage.Entite.Produit;
import com.covoiturage.covoiturage.Service.ProduitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/produits")
@CrossOrigin(origins = "http://localhost:4200")
public class ProduitController {

    @Autowired
    private ProduitService produitService;

    @GetMapping
    public List<Produit> getAllProduits() {
        return produitService.getAllProduits();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produit> getProduitById(@PathVariable Long id) {
        Optional<Produit> produit = produitService.getProduitById(id);
        return produit.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Produit createProduit(@RequestBody Produit produit) {
        return produitService.saveProduit(produit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produit> updateProduit(@PathVariable Long id,
                                                 @RequestBody Produit produitDetails) {
        Optional<Produit> optionalProduit = produitService.getProduitById(id);
        if (optionalProduit.isPresent()) {
            Produit produit = optionalProduit.get();
            produit.setNomProd(produitDetails.getNomProd());
            produit.setDescription(produitDetails.getDescription());
            produit.setPrix(produitDetails.getPrix());
            produit.setQuantiteStock(produitDetails.getQuantiteStock());
            produit.setFournisseur(produitDetails.getFournisseur());
            return ResponseEntity.ok(produitService.saveProduit(produit));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduit(@PathVariable Long id) {
        if (produitService.getProduitById(id).isPresent()) {
            produitService.deleteProduit(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // EndPoint pour récupérer les produits par fournisseur
    @GetMapping("/fournisseur/{fournisseurId}")
    public List<Produit> getProduitsByFournisseur(@PathVariable Long fournisseurId) {
        return produitService.getProduitsByFournisseur(fournisseurId);
    }

    // EndPoint pour les produits en rupture de stock
    @GetMapping("/rupture")
    public List<Produit> getProduitsEnRupture(@RequestParam(defaultValue = "5") Integer seuil) {
        return produitService.getProduitsEnRupture(seuil);
    }

    // EndPoint de recherche avancée
    @GetMapping("/search")
    public List<Produit> rechercherProduits(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) Long fournisseurId,
            @RequestParam(required = false) BigDecimal prixMin,
            @RequestParam(required = false) BigDecimal prixMax) {
        return produitService.rechercherProduits(nom, fournisseurId, prixMin, prixMax);
    }
}

