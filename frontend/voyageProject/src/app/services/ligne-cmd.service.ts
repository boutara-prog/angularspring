import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LigneCMD } from '../models/ligne-cmd.model';

@Injectable({
  providedIn: 'root'
})
export class LigneCMDService {
  private apiUrl = 'http://localhost:8080/api/lignes-commande';

  constructor(private http: HttpClient) { }

  getAllLignesCommande(): Observable<LigneCMD[]> {
    return this.http.get<LigneCMD[]>(this.apiUrl);
  }

  getLigneCommandeById(id: number): Observable<LigneCMD> {
    return this.http.get<LigneCMD>(`${this.apiUrl}/${id}`);
  }

  createLigneCommande(ligneCMD: LigneCMD): Observable<LigneCMD> {
    return this.http.post<LigneCMD>(this.apiUrl, ligneCMD);
  }

  deleteLigneCommande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getLignesCommandeByCommande(commandeId: number): Observable<LigneCMD[]> {
    return this.http.get<LigneCMD[]>(`${this.apiUrl}/commande/${commandeId}`);
  }
}