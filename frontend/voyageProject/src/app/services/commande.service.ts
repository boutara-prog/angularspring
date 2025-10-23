import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Commande, StatusCommande } from '../models/commande.model';
import { CommandeDTO } from '../models/commande.dto';
import { AuthService } from '../services/AuthService.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = 'http://localhost:8080/api/commandes';

  constructor(private http: HttpClient,private authService: AuthService) { }
private createHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
    return headers;
  }
  getAllCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl);
  }

  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  createCommande(commandeDTO: CommandeDTO): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, commandeDTO);
  }

  confirmerCommande(id: number): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}/confirmer`, {});
  }

  updateStatusCommande(id: number, status: StatusCommande): Observable<Commande> {
        const headers = this.createHeaders();
   return this.http.put<Commande>(
  `${this.apiUrl}/${id}/status`,
  JSON.stringify(status), // <== Ajoute ça
  { headers }
);
  }

  deleteCommande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCommandesByClient(clientId: number): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/client/${clientId}`);
  }
}