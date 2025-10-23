import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fournisseur } from '../models/fournisseur.model';
import { AuthService } from '../services/AuthService.service';

@Injectable({
  providedIn: 'root'
})
export class FournisseurService {
  private apiUrl = 'http://localhost:8080/api/fournisseurs';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private createHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('🔧 Création des headers avec token:', token ? 'Présent' : 'Absent');
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
    
    console.log('📋 Headers créés:', headers.get('Authorization'));
    return headers;
  }

  
  getAllFournisseurs(): Observable<Fournisseur[]> {
    const headers = this.createHeaders();
    return this.http.get<Fournisseur[]>(this.apiUrl, { headers });
  }

  getFournisseurById(id: number): Observable<Fournisseur> {
    const headers = this.createHeaders();
    return this.http.get<Fournisseur>(`${this.apiUrl}/${id}`, { headers });
  }

  createFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
    const headers = this.createHeaders();
    return this.http.post<Fournisseur>(this.apiUrl, fournisseur, { headers });
  }

  updateFournisseur(id: number, fournisseur: Fournisseur): Observable<Fournisseur> {
    const headers = this.createHeaders();
    console.log('🔧 Update Fournisseur:', id);
    return this.http.put<Fournisseur>(`${this.apiUrl}/${id}`, fournisseur, { headers });
  }

  deleteFournisseur(id: number): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}