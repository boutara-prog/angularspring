import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Fournisseur } from '../../models/fournisseur.model';
import { FournisseurService } from '../../services/fournisseur.service';
import { AuthService } from '../../services/AuthService.service';

@Component({
  selector: 'app-fournisseur',
  standalone: false,
  templateUrl: './fournisseur.html',
  styleUrl: './fournisseur.scss'
})
export class fournisseur implements OnInit {
  // Données
  fournisseurs: Fournisseur[] = [];
  filteredFournisseurs: Fournisseur[] = [];
  paginatedFournisseurs: Fournisseur[] = [];
  selectedFournisseur: Fournisseur | null = null;
  
  // États
  isEditing = false;
  showForm = false;
  loading = false;
  
  // Utilisateur et permissions
  currentUser: any = null;
  isAdmin = false;
  isFournisseur = false;
  isClient = false;

  // Filtres
  searchTerm = '';
  selectedEntreprise = '';
  sortBy = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Formulaire
  newFournisseur: Fournisseur = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    entreprise: ''
  };

  constructor(
    private fournisseurService: FournisseurService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      console.error('Utilisateur non authentifié');
      this.router.navigate(['/login']);
      return;
    }

    this.loadCurrentUser();
    this.loadFournisseurs();
  }

  // ==================== CHARGEMENT DES DONNÉES ====================

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    const role = (this.currentUser?.role || this.currentUser?.userRole || '').toUpperCase();
    this.isAdmin = role === 'ADMIN';
    this.isFournisseur = role === 'FOURNISSEUR';
    this.isClient = role === 'CLIENT';
    
    console.log('Utilisateur connecté:', {
      user: this.currentUser,
      role: role,
      isAdmin: this.isAdmin,
      isFournisseur: this.isFournisseur,
      isClient: this.isClient
    });
  }

  loadFournisseurs(): void {
    this.loading = true;
    this.fournisseurService.getAllFournisseurs().subscribe({
      next: (data) => {
        console.log('Données reçues:', data);
        
        if (this.isAdmin || this.isClient) {
          this.fournisseurs = data;
          console.log('Admin/Client: Affichage de tous les fournisseurs');
        } else if (this.isFournisseur) {
          this.fournisseurs = data.filter(f => 
            f.email === this.currentUser?.email || 
            f.userId === this.currentUser?.id ||
            f.idFour === this.currentUser?.idFour
          );
          console.log('Fournisseur: Affichage du compte personnel uniquement');
        } else {
          this.fournisseurs = [];
          console.warn('Rôle non reconnu');
        }
        
        console.log('Fournisseurs filtrés:', this.fournisseurs);
        
        this.filteredFournisseurs = [...this.fournisseurs];
        this.sortFournisseurs();
        this.updatePagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des fournisseurs:', error);
        this.loading = false;
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // ==================== STATISTIQUES ====================

  getActiveFournisseurs(): number {
    return this.fournisseurs.length;
  }

  getNewFournisseurs(): number {
    return Math.floor(this.fournisseurs.length * 0.2);
  }

  getTotalProducts(): number {
    return this.fournisseurs.length * 15;
  }

  // ==================== TITRE DYNAMIQUE ====================

  getPageTitle(): string {
    if (this.isFournisseur) {
      return 'Mon Profil Fournisseur';
    }
    return 'Liste des Fournisseurs';
  }

  // ==================== FILTRAGE ====================

  filterFournisseurs(): void {
    this.filteredFournisseurs = this.fournisseurs.filter(fournisseur => {
      const matchesSearch = !this.searchTerm || 
        fournisseur.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        fournisseur.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        fournisseur.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesEntreprise = !this.selectedEntreprise || 
        fournisseur.entreprise === this.selectedEntreprise;

      return matchesSearch && matchesEntreprise;
    });

    this.currentPage = 1;
    this.sortFournisseurs();
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedEntreprise = '';
    this.filterFournisseurs();
  }

  getUniqueEntreprises(): string[] {
    const entreprises = this.fournisseurs.map(f => f.entreprise);
    return [...new Set(entreprises)].sort();
  }

  // ==================== TRI ====================

  sort(field: keyof Fournisseur): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.sortFournisseurs();
  }

  sortFournisseurs(): void {
    this.filteredFournisseurs.sort((a, b) => {
      const aValue = a[this.sortBy as keyof Fournisseur]?.toString() || '';
      const bValue = b[this.sortBy as keyof Fournisseur]?.toString() || '';
      
      const comparison = aValue.localeCompare(bValue);
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    this.updatePagination();
  }

  // ==================== PAGINATION ====================

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredFournisseurs.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    this.goToPage(this.currentPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      const startIndex = (page - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.paginatedFournisseurs = this.filteredFournisseurs.slice(startIndex, endIndex);
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getTotalPages(): number {
    return this.totalPages;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  getEndIndex(): number {
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredFournisseurs.length);
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  // ==================== CRUD OPERATIONS ====================

  showAddForm(): void {
    if (!this.isAdmin) {
      this.showToast('Seul l\'administrateur peut ajouter des fournisseurs', 'warning');
      return;
    }
    
    this.showForm = true;
    this.isEditing = false;
    this.selectedFournisseur = null;
    this.resetForm();
  }

  editFournisseur(fournisseur: Fournisseur): void {
    if (!this.canEdit(fournisseur)) {
      this.showToast('Vous n\'avez pas la permission de modifier ce fournisseur', 'warning');
      return;
    }
    
    console.log('Edition du fournisseur:', fournisseur);
    this.showForm = true;
    this.isEditing = true;
    this.selectedFournisseur = { ...fournisseur };
    this.newFournisseur = { ...fournisseur };
    
    setTimeout(() => {
      document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  saveFournisseur(): void {
    if (this.isEditing && this.selectedFournisseur && this.selectedFournisseur.idFour) {
      if (!this.canEdit(this.selectedFournisseur)) {
        this.showToast('Vous n\'avez pas la permission de modifier ce fournisseur', 'warning');
        return;
      }

      const id = this.selectedFournisseur.idFour;
      
      this.fournisseurService.updateFournisseur(id, this.newFournisseur)
        .subscribe({
          next: (result) => {
            console.log('Fournisseur mis à jour:', result);
            this.showToast('Fournisseur mis à jour avec succès', 'success');
            this.loadFournisseurs();
            this.hideForm();
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
            this.showToast('Erreur lors de la modification', 'error');
            if (error.status === 401) {
              this.authService.logout();
              this.router.navigate(['/login']);
            }
          }
        });
    } else {
      if (!this.isAdmin) {
        this.showToast('Seul l\'administrateur peut créer des fournisseurs', 'warning');
        return;
      }
      
      this.fournisseurService.createFournisseur(this.newFournisseur)
        .subscribe({
          next: (result) => {
            console.log('Fournisseur créé:', result);
            this.showToast('Fournisseur créé avec succès', 'success');
            this.loadFournisseurs();
            this.hideForm();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.showToast('Erreur lors de la création', 'error');
            if (error.status === 401) {
              this.authService.logout();
              this.router.navigate(['/login']);
            }
          }
        });
    }
  }

  deleteFournisseur(id: number): void {
    if (!this.isAdmin) {
      this.showToast('Seul l\'administrateur peut supprimer des fournisseurs', 'warning');
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.fournisseurService.deleteFournisseur(id).subscribe({
        next: () => {
          console.log('Fournisseur supprimé');
          this.showToast('Fournisseur supprimé avec succès', 'success');
          this.loadFournisseurs();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.showToast('Erreur lors de la suppression', 'error');
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
    }
  }

  // ==================== NAVIGATION ====================

  viewProducts(fournisseur: Fournisseur): void {
    console.log('Navigation vers les produits du fournisseur:', fournisseur);
    this.router.navigate(['/produit'], { 
      queryParams: { 
        fournisseurId: fournisseur.idFour,
        fournisseurNom: `${fournisseur.prenom} ${fournisseur.nom}`,
        entreprise: fournisseur.entreprise
      } 
    });
  }

  viewDetails(fournisseur: Fournisseur): void {
    console.log('Voir détails:', fournisseur);
  }

  // ==================== GESTION FORMULAIRE ====================

  hideForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newFournisseur = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      entreprise: ''
    };
    this.selectedFournisseur = null;
    this.isEditing = false;
  }

  // ==================== IMPORT/EXPORT ====================

  exportToCSV(): void {
    if (!this.isAdmin) {
      this.showToast('Seul l\'administrateur peut exporter les données', 'warning');
      return;
    }

    const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Adresse', 'Entreprise'];
    const csvData = this.filteredFournisseurs.map(f => [
      f.idFour || '',
      f.nom || '',
      f.prenom || '',
      f.email || '',
      f.telephone || '',
      f.adresse || '',
      f.entreprise || ''
    ]);

    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `fournisseurs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast('Export CSV réussi', 'success');
  }

  exportToExcel(): void {
    if (!this.isAdmin) {
      this.showToast('Seul l\'administrateur peut exporter les données', 'warning');
      return;
    }

    // Installation requise: npm install xlsx
    // import * as XLSX from 'xlsx';
    
    try {
      // Vérifier si XLSX est disponible
      if (typeof (window as any).XLSX === 'undefined') {
        this.showToast('La bibliothèque XLSX n\'est pas installée. Utilisez: npm install xlsx', 'warning');
        return;
      }

      const XLSX = (window as any).XLSX;
      
      const worksheet = this.filteredFournisseurs.map(f => ({
        'ID': f.idFour || '',
        'Nom': f.nom || '',
        'Prénom': f.prenom || '',
        'Email': f.email || '',
        'Téléphone': f.telephone || '',
        'Adresse': f.adresse || '',
        'Entreprise': f.entreprise || ''
      }));

      const ws = XLSX.utils.json_to_sheet(worksheet);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Fournisseurs');
      XLSX.writeFile(wb, `fournisseurs_${new Date().toISOString().split('T')[0]}.xlsx`);

      this.showToast('Export Excel réussi', 'success');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      this.showToast('Erreur lors de l\'export Excel. Installez XLSX: npm install xlsx', 'error');
    }
  }

  importFromFile(event: any): void {
    if (!this.isAdmin) {
      this.showToast('Seul l\'administrateur peut importer des données', 'warning');
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const content = e.target.result;
        
        if (file.name.endsWith('.csv')) {
          this.importCSV(content);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          this.importExcel(content);
        } else {
          this.showToast('Format de fichier non supporté. Utilisez CSV ou Excel.', 'error');
        }
      } catch (error) {
        console.error('Erreur d\'import:', error);
        this.showToast('Erreur lors de l\'import', 'error');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }

    event.target.value = '';
  }

  private importCSV(content: string): void {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const fournisseurs: Fournisseur[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length < 6) continue;
      
      const fournisseur: Fournisseur = {
        nom: values[1] || '',
        prenom: values[2] || '',
        email: values[3] || '',
        telephone: values[4] || '',
        adresse: values[5] || '',
        entreprise: values[6] || ''
      };
      
      if (fournisseur.nom && fournisseur.email) {
        fournisseurs.push(fournisseur);
      }
    }

    if (fournisseurs.length === 0) {
      this.showToast('Aucun fournisseur valide trouvé dans le fichier', 'warning');
      return;
    }

    this.bulkCreateFournisseurs(fournisseurs);
  }

  private importExcel(content: string): void {
    if (typeof (window as any).XLSX === 'undefined') {
      this.showToast('La bibliothèque XLSX n\'est pas installée', 'error');
      return;
    }

    try {
      const XLSX = (window as any).XLSX;
      const workbook = XLSX.read(content, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const fournisseurs: Fournisseur[] = data.map((row: any) => ({
        nom: row['Nom'] || '',
        prenom: row['Prénom'] || '',
        email: row['Email'] || '',
        telephone: row['Téléphone'] || '',
        adresse: row['Adresse'] || '',
        entreprise: row['Entreprise'] || ''
      })).filter((f: Fournisseur) => f.nom && f.email);

      if (fournisseurs.length === 0) {
        this.showToast('Aucun fournisseur valide trouvé dans le fichier', 'warning');
        return;
      }

      this.bulkCreateFournisseurs(fournisseurs);
    } catch (error) {
      console.error('Erreur import Excel:', error);
      this.showToast('Erreur lors de l\'import Excel', 'error');
    }
  }

  private bulkCreateFournisseurs(fournisseurs: Fournisseur[]): void {
    let successCount = 0;
    let errorCount = 0;
    let processed = 0;
    
    fournisseurs.forEach((fournisseur) => {
      this.fournisseurService.createFournisseur(fournisseur).subscribe({
        next: () => {
          successCount++;
          processed++;
          if (processed === fournisseurs.length) {
            this.showImportResults(successCount, errorCount);
          }
        },
        error: (err) => {
          console.error('Erreur création fournisseur:', err);
          errorCount++;
          processed++;
          if (processed === fournisseurs.length) {
            this.showImportResults(successCount, errorCount);
          }
        }
      });
    });
  }

  private showImportResults(success: number, errors: number): void {
    this.loadFournisseurs();
    const message = `Import terminé: ${success} réussi(s), ${errors} erreur(s)`;
    this.showToast(message, errors > 0 ? 'warning' : 'success');
  }

  // ==================== UTILITAIRES ====================

  refreshList(): void {
    this.loadFournisseurs();
    this.showToast('Liste actualisée', 'info');
  }

  trackByFn(index: number, item: Fournisseur): any {
    return item.idFour;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ==================== PERMISSIONS ====================

  canEdit(fournisseur: Fournisseur): boolean {
    if (this.isAdmin) return true;
    
    if (this.isFournisseur) {
      return fournisseur.idFour === this.currentUser?.idFour || 
             fournisseur.idFour === this.currentUser?.id ||
             fournisseur.email === this.currentUser?.email;
    }
    
    return false;
  }

  canDelete(fournisseur: Fournisseur): boolean {
    return this.isAdmin;
  }

  canAdd(): boolean {
    return this.isAdmin;
  }

  canExport(): boolean {
    return this.isAdmin;
  }

  canImport(): boolean {
    return this.isAdmin;
  }

  showFilters(): boolean {
    return this.isAdmin || this.isClient;
  }

  // ==================== NOTIFICATIONS ====================

  private showToast(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Si vous avez ngx-toastr installé:
    // this.toastr.success(message) ou this.toastr.error(message)
    
    // Sinon, utiliser alert temporairement:
    alert(message);
  }
}