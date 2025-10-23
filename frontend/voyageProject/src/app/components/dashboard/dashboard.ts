import { Component, OnInit } from '@angular/core';
import { StatisticsService } from '../../services/statistics.service';
import { StatistiquesDTO, ProductStatDTO, ClientStatDTO, VentesMensuellesDTO } from '../../models/statistics.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  statistiquesGlobales: StatistiquesDTO | null = null;
  topProducts: ProductStatDTO[] = [];
  topClients: ClientStatDTO[] = [];
  ventesMensuelles: VentesMensuellesDTO[] = [];
  
  selectedYear = new Date().getFullYear();
  availableYears = [2023, 2024, 2025, 2026];
  
  // Période pour le chiffre d'affaires
  dateDebut: string = '';
  dateFin: string = '';
  revenueByPeriod: number | null = null;
  
  loading = false;

  constructor(private statisticsService: StatisticsService) { }

  ngOnInit(): void {
    this.loadStatistiques();
    this.loadTopProducts();
    this.loadTopClients();
    this.loadMonthlySales();
    this.initializeDates();
  }

  initializeDates(): void {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.dateDebut = firstDayOfMonth.toISOString().split('T')[0];
    this.dateFin = lastDayOfMonth.toISOString().split('T')[0];
  }

  loadStatistiques(): void {
    this.loading = true;
    this.statisticsService.getStatistiquesGlobales().subscribe({
      next: (data) => {
        console.log('datastat',data);
        this.statistiquesGlobales = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.loading = false;
      }
    });
  }

  loadTopProducts(): void {
    this.statisticsService.getTopProducts(5).subscribe({
      
      next: (data) => this.topProducts = data,
      
      error: (error) => console.error('Erreur lors du chargement des top produits:', error)
    });
  }

  loadTopClients(): void {
    this.statisticsService.getTopClients(5).subscribe({
      next: (data) => this.topClients = data,
      error: (error) => console.error('Erreur lors du chargement des top clients:', error)
    });
  }

  loadMonthlySales(): void {
    this.statisticsService.getMonthlySales(this.selectedYear).subscribe({
      next: (data) => this.ventesMensuelles = data,
      error: (error) => console.error('Erreur lors du chargement des ventes mensuelles:', error)
    });
  }

  onYearChange(): void {
    this.loadMonthlySales();
  }

  calculateRevenue(): void {
    if (this.dateDebut && this.dateFin) {
      const debut = new Date(this.dateDebut);
      const fin = new Date(this.dateFin);
      
      this.statisticsService.getRevenueByPeriod(debut, fin).subscribe({
        next: (data) => this.revenueByPeriod = data,
        error: (error) => console.error('Erreur lors du calcul du CA:', error)
      });
    }
  }

  getMonthName(month: number): string {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    return months[month - 1];
  }
}