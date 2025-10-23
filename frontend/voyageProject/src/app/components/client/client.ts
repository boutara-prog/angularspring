import { Component, OnInit } from '@angular/core';
import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client',
  standalone: false,
  templateUrl: './client.html',
  styleUrl: './client.scss'
})
export class client implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  selectedClient: Client | null = null;
  isEditing = false;
  showForm = false;
  searchTerm = '';

  newClient: Client = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: ''
  };

  constructor(private clientService: ClientService) { }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.filteredClients = data;
      },
      error: (error) => console.error('Erreur lors du chargement des clients:', error)
    });
  }

  searchClients(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredClients = this.clients;
    } else {
      // Recherche locale d'abord
      this.filteredClients = this.clients.filter(client =>
        client.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        client.telephone.includes(this.searchTerm)
      );

      // Si vous voulez utiliser l'endpoint de recherche côté serveur :
      // this.clientService.searchClients(this.searchTerm).subscribe({
      //   next: (data) => this.filteredClients = data,
      //   error: (error) => console.error('Erreur lors de la recherche:', error)
      // });
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredClients = this.clients;
  }

  showAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.selectedClient = null;
    this.resetForm();
  }

  editClient(client: Client): void {
    this.showForm = true;
    this.isEditing = true;
    this.selectedClient = client;
    this.newClient = { ...client };
  }

  saveClient(): void {
    if (this.isEditing && this.selectedClient) {
      this.clientService.updateClient(this.selectedClient.id!, this.newClient)
        .subscribe({
          next: () => {
            this.loadClients();
            this.hideForm();
          },
          error: (error) => console.error('Erreur lors de la modification:', error)
        });
    } else {
      this.clientService.createClient(this.newClient)
        .subscribe({
          next: () => {
            this.loadClients();
            this.hideForm();
          },
          error: (error) => console.error('Erreur lors de la création:', error)
        });
    }
  }

  deleteClient(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => this.loadClients(),
        error: (error) => console.error('Erreur lors de la suppression:', error)
      });
    }
  }

  hideForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newClient = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: ''
    };
  }
}
