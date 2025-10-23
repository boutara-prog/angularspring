package com.covoiturage.covoiturage.controller;


import com.covoiturage.covoiturage.Entite.Stock;
import com.covoiturage.covoiturage.Service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "http://localhost:4200")
public class StockController {

    @Autowired
    private StockService stockService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FOURNISSEUR')")
    public List<Stock> getAllStocks() {
        return stockService.getAllStocks();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FOURNISSEUR')")
    public ResponseEntity<Stock> getStockById(@PathVariable Long id) {
        Optional<Stock> stock = stockService.getStockById(id);
        return stock.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/produit/{produitId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FOURNISSEUR')")
    public ResponseEntity<Stock> getStockByProduit(@PathVariable Long produitId) {
        Optional<Stock> stock = stockService.getStockByProduit(produitId);
        return stock.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rupture")
    @PreAuthorize("hasAnyRole('ADMIN', 'FOURNISSEUR')")
    public List<Stock> getProduitsEnRupture() {
        return stockService.getProduitsEnRupture();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FOURNISSEUR')")
    public Stock createStock(@RequestBody Stock stock) {
        return stockService.saveStock(stock);
    }

    @PutMapping("/{produitId}/quantite")
    @PreAuthorize("hasAnyRole('ADMIN', 'FOURNISSEUR')")
    public ResponseEntity<Stock> updateQuantite(@PathVariable Long produitId,
                                                @RequestParam Integer quantite) {
        try {
            Stock stock = stockService.updateQuantite(produitId, quantite);
            return ResponseEntity.ok(stock);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStock(@PathVariable Long id) {
        if (stockService.getStockById(id).isPresent()) {
            stockService.deleteStock(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    @PutMapping("/{produitId}/diminuer")
    public ResponseEntity<Stock> diminuerQuantite(
            @PathVariable Long produitId,
            @RequestParam int quantite
    ) {
        Stock stock = stockService.diminuerQuantite(produitId, quantite);
        return ResponseEntity.ok(stock);
    }
}