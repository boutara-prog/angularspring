package com.covoiturage.covoiturage.controller;


import com.covoiturage.covoiturage.Service.StatistiquesService;
import com.covoiturage.covoiturage.dto.ClientStatDTO;
import com.covoiturage.covoiturage.dto.ProductStatDTO;
import com.covoiturage.covoiturage.dto.StatistiquesDTO;
import com.covoiturage.covoiturage.dto.VentesMensuellesDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private StatistiquesService statistiquesService;

    @GetMapping("/statistics")
    public ResponseEntity<StatistiquesDTO> getStatistiquesGlobales() {
        StatistiquesDTO stats = statistiquesService.getStatistiquesGlobales();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<ProductStatDTO>> getTopProducts(
            @RequestParam(defaultValue = "5") int limit) {
        List<ProductStatDTO> topProducts = statistiquesService.getTopProduitsVendus(limit);
        return ResponseEntity.ok(topProducts);
    }

    @GetMapping("/top-clients")
    public ResponseEntity<List<ClientStatDTO>> getTopClients(
            @RequestParam(defaultValue = "5") int limit) {
        List<ClientStatDTO> topClients = statistiquesService.getTopClients(limit);
        return ResponseEntity.ok(topClients);
    }

    @GetMapping("/monthly-sales/{year}")
    public ResponseEntity<List<VentesMensuellesDTO>> getMonthlySales(@PathVariable int year) {
        List<VentesMensuellesDTO> monthlySales = statistiquesService.getVentesMensuelles(year);
        return ResponseEntity.ok(monthlySales);
    }

    @GetMapping("/revenue")
    public ResponseEntity<BigDecimal> getRevenueByPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        BigDecimal revenue = statistiquesService.getChiffreAffairesParPeriode(debut, fin);
        return ResponseEntity.ok(revenue);
    }
}
