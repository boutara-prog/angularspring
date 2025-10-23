package com.covoiturage.covoiturage.Service;

import com.covoiturage.covoiturage.Entite.StatusCommande;
import com.covoiturage.covoiturage.dto.ClientStatDTO;
import com.covoiturage.covoiturage.dto.ProductStatDTO;
import com.covoiturage.covoiturage.dto.StatistiquesDTO;
import com.covoiturage.covoiturage.dto.VentesMensuellesDTO;
import com.covoiturage.covoiturage.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StatistiquesService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private LigneCMDRepository ligneCMDRepository;

    public StatistiquesDTO getStatistiquesGlobales() {
        StatistiquesDTO stats = new StatistiquesDTO();

        stats.setTotalClients(clientRepository.count());
        stats.setTotalProduits(produitRepository.count());
        stats.setTotalCommandes(commandeRepository.count());
        stats.setProduitsEnRupture((long) stockRepository.findProduitsEnRupture().size());

        // Chiffre d'affaires du mois en cours
        LocalDateTime debutMois = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime finMois = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()).atTime(23, 59, 59);




        BigDecimal ca = commandeRepository.findByDateCMDBetweenAndStatusIn(
                        debutMois, finMois,
                        List.of(StatusCommande.PAYEE, StatusCommande.LIVREE, StatusCommande.EXPEDIEE)
                ).stream()
                .map(c -> c.getMontantTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.setChiffreAffairesMensuel(ca);


        return stats;
    }

    public List<ProductStatDTO> getTopProduitsVendus(int limit) {
        // Utiliser Pageable pour la limite
        return ligneCMDRepository.findTopProduits(PageRequest.of(0, limit));
    }
    public List<ClientStatDTO> getTopClients(int limit) {
        return commandeRepository.findTopClients(limit);
    }

    public List<VentesMensuellesDTO> getVentesMensuelles(int annee) {
        return commandeRepository.findVentesMensuelles(annee);
    }

    public BigDecimal getChiffreAffairesParPeriode(LocalDateTime debut, LocalDateTime fin) {
        return commandeRepository.findByDateCMDBetweenAndStatusIn(debut, fin, List.of(StatusCommande.PAYEE, StatusCommande.LIVREE, StatusCommande.EXPEDIEE))
                .stream()
                .map(c -> c.getMontantTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}