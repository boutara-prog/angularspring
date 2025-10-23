package com.covoiturage.covoiturage.repository;

import com.covoiturage.covoiturage.Entite.LigneCMD;
import com.covoiturage.covoiturage.dto.ProductStatDTO;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LigneCMDRepository extends JpaRepository<LigneCMD, Long> {
    List<LigneCMD> findByCommandeId(Long commandeId);
    @Query("SELECT NEW com.covoiturage.covoiturage.dto.ProductStatDTO(" +
            "p.nomProd, " +
            "SUM(lc.quantite), " +
            "SUM(lc.prixUnitaire * lc.quantite)) " +
            "FROM LigneCMD lc " +
            "JOIN lc.produit p " +
            "JOIN lc.commande c " +
            "WHERE c.status IN ('PAYEE', 'EXPEDIEE', 'LIVREE') " +
            "GROUP BY p.id, p.nomProd " +
            "ORDER BY SUM(lc.quantite) DESC")
    List<ProductStatDTO> findTopProduits(@Param("limit") PageRequest limit);
}
