import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  username: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  role: string;
  adresse?: string;
  entreprise?: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  role: string;
  id: number;
  email: string;
  nom: string;
  prenom: string;
  idClient?: number;
  idFour?: number; // ✅ Optionnel si le backend l'envoie
}

export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<any>(null);
  
  public token$ = this.tokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeFromStorage();
    }
  }

  private initializeFromStorage(): void {
    const token = this.getFromStorage('jwt_token');
    const user = this.getFromStorage('current_user');
    
    if (token && !this.isTokenExpired(token)) {
      this.tokenSubject.next(token);
      if (user) {
        try {
          this.userSubject.next(JSON.parse(user));
        } catch (error) {
          console.error('Erreur parsing user data:', error);
          this.removeFromStorage('current_user');
        }
      }
    } else if (token) {
      this.logout();
    }
  }

  private getFromStorage(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setToStorage(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  private removeFromStorage(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  // ✅ Méthode pour récupérer l'idFour d'un fournisseur
  private getFournisseurIdByUserId(userId: number): Observable<any> {
    const headers = {
      'Authorization': `Bearer ${this.getToken()}`
    };
    
    return this.http.get<any>(`http://localhost:8080/api/fournisseurs/${userId}`, { headers });
  }

  login(credentials: LoginRequest): Observable<JwtResponse> {
    console.log('Tentative de connexion pour:', credentials.email);
    console.log('URL appelée:', `${this.apiUrl}/login`);
    
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        // ✅ Si c'est un fournisseur, charger son idFour
        switchMap((response: JwtResponse) => {
          console.log('Réponse login reçue:', response);
          
          if (response.token) {
            // Stocker temporairement le token pour l'utiliser dans la requête suivante
            this.setToStorage('jwt_token', response.token);
            this.tokenSubject.next(response.token);
            
            // Si c'est un fournisseur et qu'on n'a pas déjà l'idFour
            if (response.role === 'FOURNISSEUR' && !response.idFour) {
              console.log('Chargement de l\'idFour pour le fournisseur...');
              
              return this.getFournisseurIdByUserId(response.id).pipe(
                tap(fournisseur => {
                  console.log('Fournisseur trouvé:', fournisseur);
                  
                  const userData = {
                    id: fournisseur.idFour, // ✅ Utiliser idFour au lieu de l'id user
                    userId: response.id,     // Garder aussi l'id user si besoin
                    email: response.email,
                    userRole: response.role,
                    nom: response.nom,
                    prenom: response.prenom,
                    idFour: fournisseur.idFour, // ✅ Stocker explicitement idFour
                    entreprise: fournisseur.entreprise
                  };

                  this.setToStorage('current_user', JSON.stringify(userData));
                  this.userSubject.next(userData);
                  console.log('Login fournisseur réussi avec idFour:', userData);
                }),
                switchMap(() => [response]) // Retourner la réponse originale
              );
            } else {
              console.log('response',response);
              // Pour les autres rôles (ADMIN, CLIENT)
              const userData = {
                id: response.id,
                email: response.email,
                userRole: response.role,
                nom: response.nom,
                prenom: response.prenom,
                idClient: response.idClient,
                idFour: response.idFour // Si fourni par le backend
              };

              this.setToStorage('current_user', JSON.stringify(userData));
              this.userSubject.next(userData);
              console.log('Login réussi:', userData);
              
              return [response];
            }
          }
          
          return [response];
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Erreur de login:', error);
          console.error('Status:', error.status);
          console.error('Error body:', error.error);
          
          let errorMessage = 'Erreur de connexion';
          
          if (error.status === 400) {
            errorMessage = 'Identifiants invalides';
          } else if (error.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (error.status === 0) {
            errorMessage = 'Erreur de connexion au serveur';
          }
          
          return throwError(() => ({
            message: errorMessage,
            status: error.status,
            error: error.error
          }));
        })
      );
  }

  register(userData: RegisterRequest): Observable<User> {
    console.log('Appel API register CLIENT:', `${this.apiUrl}/register`);
    console.log('Données envoyées:', userData);
    
    return this.http.post<User>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => console.log('Réponse register:', response)),
        catchError((error: HttpErrorResponse) => {
          console.error('Erreur de registration CLIENT:', error);
          let errorMessage = 'Erreur lors de l\'inscription';
          
          if (error.status === 400) {
            errorMessage = 'Données invalides';
          } else if (error.status === 409) {
            errorMessage = 'Un compte existe déjà avec cet email';
          }
          
          return throwError(() => ({
            message: errorMessage,
            status: error.status,
            error: error.error
          }));
        })
      );
  }

  registerFournisseur(userData: RegisterRequest): Observable<any> {
    console.log('Appel API register FOURNISSEUR:', `${this.apiUrl}/register/fournisseur`);
    console.log('Données envoyées:', userData);
    
    return this.http.post<any>(`${this.apiUrl}/register/fournisseur`, userData)
      .pipe(
        tap(response => console.log('Réponse register fournisseur:', response)),
        catchError((error: HttpErrorResponse) => {
          console.error('Erreur de registration FOURNISSEUR:', error);
          let errorMessage = 'Erreur lors de l\'inscription du fournisseur';
          
          if (error.status === 400) {
            errorMessage = 'Données invalides. Vérifiez tous les champs requis.';
          } else if (error.status === 409) {
            errorMessage = 'Un compte existe déjà avec cet email';
          } else if (error.status === 500) {
            errorMessage = 'Erreur serveur lors de la création du fournisseur';
          }
          
          return throwError(() => ({
            message: errorMessage,
            status: error.status,
            error: error.error
          }));
        })
      );
  }

  logout(): void {
    this.removeFromStorage('jwt_token');
    this.removeFromStorage('current_user');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    console.log('Logout completed');
  }

  isAuthenticated(): boolean {
    const token = this.getFromStorage('jwt_token');
    const isValid = token != null && !this.isTokenExpired(token);
    console.log('isAuthenticated check:', { hasToken: !!token, isValid });
    return isValid;
  }

  getToken(): string | null {
    return this.getFromStorage('jwt_token');
  }

  getCurrentUser(): any {
    const user = this.getFromStorage('current_user');
    console.log('getCurrentUser:', user);
    if (user) {
      try {
        return JSON.parse(user);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        this.removeFromStorage('current_user');
        return null;
      }
    }
    return null;
  }

  private isTokenExpired(token: string): boolean {
    if (!token || !isPlatformBrowser(this.platformId)) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      
      if (isExpired) {
        console.log('Token expiré');
      }
      
      return isExpired;
    } catch (error) {
      console.error('Erreur décodage token:', error);
      return true;
    }
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}