package com.covoiturage.covoiturage.Service;

import com.covoiturage.covoiturage.Entite.Produit;
import com.covoiturage.covoiturage.Entite.Stock;
import com.covoiturage.covoiturage.repository.ProduitRepository;
import com.covoiturage.covoiturage.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private ProduitRepository produitRepository;

    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    public Optional<Stock> getStockById(Long id) {
        return stockRepository.findById(id);
    }

    public Optional<Stock> getStockByProduit(Long produitId) {
        return stockRepository.findByProduitId(produitId);
    }

    public List<Stock> getProduitsEnRupture() {
        return stockRepository.findProduitsEnRupture();
    }

    public List<Stock> getStocksParFournisseur(Long fournisseurId) {
        return stockRepository.findByProduitFournisseurIdFour(fournisseurId);
    }

    public Stock saveStock(Stock stock) {
        return stockRepository.save(stock);
    }

    /**
     * 🆕 Mettre à jour la quantité en stock ET synchroniser avec le produit
     */
    @Transactional
    public Stock updateQuantite(Long produitId, Integer nouvelleQuantite) {
        // 1. Trouver ou créer le stock
        Optional<Stock> optionalStock = stockRepository.findByProduitId(produitId);
        Stock stock;

        if (optionalStock.isPresent()) {
            stock = optionalStock.get();
        } else {
            // Créer un nouveau stock si inexistant
            Optional<Produit> produitOpt = produitRepository.findById(produitId);
            if (produitOpt.isEmpty()) {
                throw new RuntimeException("Produit non trouvé avec l'ID: " + produitId);
            }
            stock = new Stock();
            stock.setProduit(produitOpt.get());
        }

        // 2. Mettre à jour la quantité
        stock.setQuantiteStock(nouvelleQuantite);
        Stock savedStock = stockRepository.save(stock);

        // 3. Synchroniser avec le produit
        Produit produit = savedStock.getProduit();
        produit.setQuantiteStock(nouvelleQuantite);
        produitRepository.save(produit);

        return savedStock;
    }

    public void deleteStock(Long id) {
        stockRepository.deleteById(id);
    }

    @Transactional
    public Stock diminuerQuantite(Long produitId, int quantite) {
        // Vérifier que la quantité demandée est valide
        if (quantite <= 0) {
            throw new IllegalArgumentException("La quantité à diminuer doit être supérieure à 0.");
        }

        // Récupérer le stock du produit
        Stock stock = stockRepository.findByProduitId(produitId)
                .orElseThrow(() -> new RuntimeException("Stock non trouvé pour le produit ID : " + produitId));

        int quantiteActuelle = stock.getQuantiteStock();

        // Vérifier si le stock est suffisant
        if (quantiteActuelle < quantite) {
            throw new RuntimeException("Quantité insuffisante en stock pour le produit ID : " + produitId);
        }

        // Diminuer la quantité
        int nouvelleQuantite = quantiteActuelle - quantite;
        stock.setQuantiteStock(nouvelleQuantite);

        // Sauvegarder le stock mis à jour
        Stock savedStock = stockRepository.save(stock);

        // Synchroniser avec le produit associé
        Produit produit = savedStock.getProduit();
        produit.setQuantiteStock(nouvelleQuantite);
        produitRepository.save(produit);

        return savedStock;
    }

}