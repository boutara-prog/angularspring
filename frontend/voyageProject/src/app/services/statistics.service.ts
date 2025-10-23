import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatistiquesDTO, ProductStatDTO, ClientStatDTO, VentesMensuellesDTO } from '../models/statistics.model';
import { AuthService } from '../services/AuthService.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) { }

  private createHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
    
    return headers;
  }

  getStatistiquesGlobales(): Observable<StatistiquesDTO> {
    const headers = this.createHeaders();
    return this.http.get<StatistiquesDTO>(`${this.apiUrl}/statistics`, { headers });
  }

  getTopProducts(limit: number = 5): Observable<ProductStatDTO[]> {
    const params = new HttpParams().set('limit', limit.toString());
    const headers = this.createHeaders();
    return this.http.get<ProductStatDTO[]>(`${this.apiUrl}/top-products`, { params, headers });
  }

  

  getTopClients(limit: number = 5): Observable<ClientStatDTO[]> {
    const params = new HttpParams().set('limit', limit.toString());
    const headers = this.createHeaders();
    return this.http.get<ClientStatDTO[]>(`${this.apiUrl}/top-clients`, { params, headers });
  }

  getMonthlySales(year: number): Observable<VentesMensuellesDTO[]> {
    const headers = this.createHeaders();
    return this.http.get<VentesMensuellesDTO[]>(`${this.apiUrl}/monthly-sales/${year}`, { headers });
  }

  getRevenueByPeriod(debut: Date, fin: Date): Observable<number> {
    const params = new HttpParams()
      .set('debut', debut.toISOString())
      .set('fin', fin.toISOString());
    const headers = this.createHeaders();
    return this.http.get<number>(`${this.apiUrl}/revenue`, { params, headers });
  }
}