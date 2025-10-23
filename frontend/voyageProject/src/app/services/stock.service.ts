import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../models/stock.model';
import {  Produit } from '../models/produit.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private apiUrl = 'http://localhost:8080/api/stocks';

  constructor(private http: HttpClient) { }

  /**
   * Récupérer tous les stocks
   */
  getAllStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }

  /**
   * Récupérer un stock par son ID
   */
  getStockById(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer le stock d'un produit spécifique
   */
  getStockByProduit(produitId: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/produit/${produitId}`);
  }

  /**
   * Récupérer tous les produits en rupture de stock
   */
  getProduitsEnRupture(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/rupture`);
  }

  /**
   * Créer un nouveau stock
   */
  createStock(stock: Stock): Observable<Stock> {
    return this.http.post<Stock>(this.apiUrl, stock);
  }

  /**
   * Mettre à jour la quantité d'un produit
   */
  updateQuantite(produitId: number, quantite: number): Observable<Stock> {
    const params = new HttpParams().set('quantite', quantite.toString());
    return this.http.put<Stock>(
      `${this.apiUrl}/${produitId}/quantite`,
      {},
      { params }
    );
  }


  diminuerQuantite(produitId: number, quantiteADiminuer: number): Observable<Stock> {
    const params = new HttpParams().set('quantite', quantiteADiminuer.toString());
    return this.http.put<Stock>(
      `${this.apiUrl}/${produitId}/diminuer`,
      {},
      { params }
    );
  }
  /**
   * Supprimer un stock
   */
  deleteStock(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
