package com.covoiturage.covoiturage.repository;


import com.covoiturage.covoiturage.Entite.Commande;
import com.covoiturage.covoiturage.Entite.StatusCommande;
import com.covoiturage.covoiturage.dto.ClientStatDTO;
import com.covoiturage.covoiturage.dto.VentesMensuellesDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {

    List<Commande> findByClientIdClient(Long clientId);
    List<Commande> findByStatus(StatusCommande status);

    @Query("SELECT SUM(c.montantTotal) FROM Commande c WHERE " +
            "c.dateCMD >= :startDate AND c.dateCMD <= :endDate AND c.status = 'PAYEE'")
    BigDecimal getTotalVentesByPeriod(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    @Query("SELECT c.client, COUNT(c) as totalCommandes, SUM(c.montantTotal) as totalMontant " +
            "FROM Commande c " +
            "WHERE c.status = 'PAYEE' " +
            "GROUP BY c.client " +
            "ORDER BY totalMontant DESC")
    List<Object[]> findTopClients();
    @Query("SELECT c FROM Commande c WHERE c.dateCMD BETWEEN :debut AND :fin AND c.status = :status")
    List<Commande> findByDateCMDBetweenAndStatus(LocalDateTime debut, LocalDateTime fin, StatusCommande status);

    @Query("SELECT c FROM Commande c WHERE c.dateCMD BETWEEN :debut AND :fin AND c.status IN :statusList")
    List<Commande> findByDateCMDBetweenAndStatusIn(
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin,
            @Param("statusList") List<StatusCommande> statusList
    );
    @Query("SELECT new com.covoiturage.covoiturage.dto.ClientStatDTO(" +
            "cl.nom, cl.prenom, COUNT(c), SUM(c.montantTotal)) " +
            "FROM Commande c JOIN c.client cl " +
            "WHERE c.status IN ('PAYEE', 'EXPEDIEE', 'LIVREE') " +
            "GROUP BY cl.id, cl.nom, cl.prenom " +
            "ORDER BY SUM(c.montantTotal) DESC")
    List<ClientStatDTO> findTopClients(int limit);


    @Query("SELECT new com.covoiturage.covoiturage.dto.VentesMensuellesDTO(" +
            "MONTH(c.dateCMD), YEAR(c.dateCMD), SUM(c.montantTotal), COUNT(c)) " +
            "FROM Commande c " +
            "WHERE YEAR(c.dateCMD) = :annee " +
            "AND c.status IN ('PAYEE', 'EXPEDIEE', 'LIVREE') " +
            "GROUP BY MONTH(c.dateCMD), YEAR(c.dateCMD) " +
            "ORDER BY MONTH(c.dateCMD)")
    List<VentesMensuellesDTO> findVentesMensuelles(@Param("annee") int annee);
}