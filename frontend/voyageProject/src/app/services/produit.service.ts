import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Produit } from '../models/produit.model';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private apiUrl = 'http://localhost:8080/api/produits';

  constructor(private http: HttpClient) { }

  /**
   * Récupérer tous les produits
   */
  getAllProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.apiUrl);
  }

  /**
   * Récupérer un produit par son ID
   */
  getProduitById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un produit (le stock est créé automatiquement par le backend)
   */
  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit).pipe(
      tap(() => console.log('✅ Produit créé et stock initialisé automatiquement'))
    );
  }

  /**
   * Mettre à jour un produit (le stock est mis à jour automatiquement par le backend)
   */
  updateProduit(id: number, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, produit).pipe(
      tap(() => console.log('✅ Produit et stock mis à jour automatiquement'))
    );
  }

  /**
   * Supprimer un produit (le stock est supprimé automatiquement par le backend)
   */
  deleteProduit(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('✅ Produit et stock supprimés automatiquement'))
    );
  }

  /**
   * Récupérer les produits d'un fournisseur
   */
  getProduitsByFournisseur(fournisseurId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/fournisseur/${fournisseurId}`);
  }

  /**
   * Récupérer les produits en rupture de stock
   */
  getProduitsEnRupture(seuil: number = 5): Observable<Produit[]> {
    const params = new HttpParams().set('seuil', seuil.toString());
    return this.http.get<Produit[]>(`${this.apiUrl}/rupture`, { params });
  }

  diminuerQuantiteStock(produitId: number, quantiteADiminuer: number): Observable<Produit> {
    const params = new HttpParams().set('quantite', quantiteADiminuer.toString());
    return this.http.put<Produit>(
      `${this.apiUrl}/${produitId}/diminuer-stock`,
      {},
      { params }
    );
  }
  /**
   * Recherche avancée de produits
   */
  rechercherProduits(
    nom?: string,
    fournisseurId?: number,
    prixMin?: number,
    prixMax?: number
  ): Observable<Produit[]> {
    let params = new HttpParams();
    
    if (nom) params = params.set('nom', nom);
    if (fournisseurId) params = params.set('fournisseurId', fournisseurId.toString());
    if (prixMin !== undefined && prixMin !== null) params = params.set('prixMin', prixMin.toString());
    if (prixMax !== undefined && prixMax !== null) params = params.set('prixMax', prixMax.toString());

    return this.http.get<Produit[]>(`${this.apiUrl}/search`, { params });
  }
}