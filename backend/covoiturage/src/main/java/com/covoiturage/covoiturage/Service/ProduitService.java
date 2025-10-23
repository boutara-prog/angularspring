package com.covoiturage.covoiturage.Service;


import com.covoiturage.covoiturage.Entite.Produit;
import com.covoiturage.covoiturage.Entite.Stock;
import com.covoiturage.covoiturage.repository.ProduitRepository;
import com.covoiturage.covoiturage.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import com.covoiturage.covoiturage.repository.StockRepository;

@Service
public class ProduitService {

    @Autowired
    private ProduitRepository produitRepository;
    @Autowired
    private StockRepository stockRepository;
    public List<Produit> getAllProduits() {
        return produitRepository.findAll();
    }

    public Optional<Produit> getProduitById(Long id) {
        return produitRepository.findById(id);
    }



  
    public Produit saveProduit(Produit produit) {
        // 1. Sauvegarder le produit
        Produit savedProduit = produitRepository.save(produit);


        Optional<Stock> existingStock = stockRepository.findByProduitId(savedProduit.getId());

        if (existingStock.isPresent()) {
            // Mettre à jour le stock existant
            Stock stock = existingStock.get();
            stock.setQuantiteStock(savedProduit.getQuantiteStock());
            stockRepository.save(stock);
        } else {
            // Créer un nouveau stock
            Stock newStock = new Stock();
            newStock.setProduit(savedProduit);
            newStock.setQuantiteStock(savedProduit.getQuantiteStock());
            stockRepository.save(newStock);
        }

        return savedProduit;
    }


    public void deleteProduit(Long id) {
        produitRepository.deleteById(id);
    }

    public List<Produit> getProduitsByFournisseur(Long fournisseurId) {
        return produitRepository.findByFournisseurIdFour(fournisseurId);
    }

    public List<Produit> getProduitsEnRupture(Integer seuil) {
        return produitRepository.findProduitsEnRuptureDeStock(seuil != null ? seuil : 5);
    }

    public List<Produit> rechercherProduits(String nom, Long fournisseurId,
                                            BigDecimal prixMin, BigDecimal prixMax) {
        return produitRepository.findByMultipleCriteria(nom, fournisseurId, prixMin, prixMax);
    }

    public boolean updateStock(Long produitId, Integer quantiteVendue) {
        Optional<Produit> optionalProduit = produitRepository.findById(produitId);
        if (optionalProduit.isPresent()) {
            Produit produit = optionalProduit.get();
            if (produit.getQuantiteStock() >= quantiteVendue) {
                produit.setQuantiteStock(produit.getQuantiteStock() - quantiteVendue);
                produitRepository.save(produit);
                return true;
            }
        }
        return false;
    }
}