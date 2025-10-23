import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  searchForm: FormGroup;
  activeTab: 'search' | 'publish' = 'search';
  popularRoutes: any[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      departure: ['', Validators.required],
      arrival: ['', Validators.required],
      date: ['', Validators.required],
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(8)]]
    });
  }

  ngOnInit(): void {
    this.setDefaultDate();
    this.loadPopularRoutes(); // on charge les trajets fictifs
  }

  /** Définit la date de demain par défaut */
  setDefaultDate(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.searchForm.patchValue({
      date: tomorrow.toISOString().split('T')[0]
    });
  }

  /** Gestion de la recherche */
  onSearch(): void {
    if (this.searchForm.valid) {
      this.isLoading = true;

      // Simulation pour voir le rendu
      console.log('Recherche avec:', this.searchForm.value);

      // Si tu veux tester la navigation, décommente :
      // this.router.navigate(['/search'], { queryParams: this.searchForm.value });

      setTimeout(() => {
        this.isLoading = false;
      }, 1500);
    } else {
      this.searchForm.markAllAsTouched();
    }
  }

  /** Gestion des onglets */
  setActiveTab(tab: 'search' | 'publish'): void {
    this.activeTab = tab;
  }

  /** Mock des trajets populaires */
  loadPopularRoutes(): void {
    this.popularRoutes = [
      { departure: 'Paris', arrival: 'Lyon', count: 125 },
      { departure: 'Marseille', arrival: 'Nice', count: 98 },
      { departure: 'Bordeaux', arrival: 'Toulouse', count: 76 },
      { departure: 'Lille', arrival: 'Bruxelles', count: 54 },
      { departure: 'Madrid', arrival: 'Barcelone', count: 142 },
      { departure: 'Rome', arrival: 'Milan', count: 67 }
    ];
  }

  /** Quand on clique sur un trajet populaire */
  selectRoute(route: any): void {
    this.searchForm.patchValue({
      departure: route.departure,
      arrival: route.arrival
    });
  }

  /** Navigation vers la publication */
  onPublish(): void {
    console.log('Navigation vers la page publication...');
     this.router.navigate(['/publish']);
  }
}
