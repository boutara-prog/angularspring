package com.covoiturage.covoiturage.repository;

import com.covoiturage.covoiturage.Entite.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    /**
     * Trouver le stock d'un produit spécifique
     */
    @Query("SELECT s FROM Stock s WHERE s.produit.id = :produitId")
    Optional<Stock> findByProduitId(@Param("produitId") Long produitId);

    /**
     * Trouver tous les stocks d'un fournisseur
     */
    @Query("SELECT s FROM Stock s WHERE s.produit.fournisseur.idFour = :fournisseurId")
    List<Stock> findByProduitFournisseurIdFour(@Param("fournisseurId") Long fournisseurId);

    /**
     * Trouver les produits avec une quantité spécifique
     * ⚠️ Utilisation de requête JPQL pour éviter les problèmes de naming
     */
    @Query("SELECT s FROM Stock s WHERE s.quantiteStock = :quantite")
    List<Stock> findByQuantiteStock(@Param("quantite") Integer quantite);

    /**
     * Trouver les produits avec stock faible (≤ seuil)
     */
    @Query("SELECT s FROM Stock s WHERE s.quantiteStock <= :seuil")
    List<Stock> findByQuantiteStockLessThanEqual(@Param("seuil") Integer seuil);

    /**
     * Trouver les produits en rupture de stock
     */
    @Query("SELECT s FROM Stock s WHERE s.quantiteStock = 0")
    List<Stock> findProduitsEnRupture();

    /**
     * Trouver les produits avec stock entre deux valeurs
     */
    @Query("SELECT s FROM Stock s WHERE s.quantiteStock BETWEEN :min AND :max")
    List<Stock> findByQuantiteStockBetween(@Param("min") Integer min, @Param("max") Integer max);
}