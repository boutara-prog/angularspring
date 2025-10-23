package com.covoiturage.covoiturage.repository;

import com.covoiturage.covoiturage.Entite.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByFournisseurIdFour(Long fournisseurId);

    @Query("SELECT p FROM Produit p WHERE p.quantiteStock < :seuil")
    List<Produit> findProduitsEnRuptureDeStock(@Param("seuil") Integer seuil);

    @Query("SELECT p FROM Produit p WHERE " +
            "(:nom IS NULL OR LOWER(p.nomProd) LIKE LOWER(CONCAT('%', :nom, '%'))) AND " +
            "(:fournisseurId IS NULL OR p.fournisseur.idFour = :fournisseurId) AND " +
            "(:prixMin IS NULL OR p.prix >= :prixMin) AND " +
            "(:prixMax IS NULL OR p.prix <= :prixMax)")
    List<Produit> findByMultipleCriteria(@Param("nom") String nom,
                                         @Param("fournisseurId") Long fournisseurId,
                                         @Param("prixMin") BigDecimal prixMin,
                                         @Param("prixMax") BigDecimal prixMax);

    @Query("SELECT p, SUM(l.quantite) as totalVendu FROM Produit p " +
            "JOIN p.lignesCommande l " +
            "GROUP BY p " +
            "ORDER BY totalVendu DESC")
    List<Object[]> findTopSellingProducts();
}
