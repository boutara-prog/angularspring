import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../../services/AuthService.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = ''; // ✅ Ajout de la propriété manquante
  showPassword = false; // ✅ Pour le toggle du mot de passe

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialisation du formulaire avec rememberMe
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false] // ✅ Ajout du champ "Se souvenir de moi"
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const credentials: LoginRequest = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Connexion réussie ! Redirection...';
          console.log('Connexion réussie:', response);
          
          // Gérer "Se souvenir de moi"
          if (this.loginForm.get('rememberMe')?.value) {
            localStorage.setItem('rememberMe', 'true');
          }
          
          // Redirection après un court délai pour montrer le message de succès
          setTimeout(() => {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/fournisseur';
            this.router.navigate([returnUrl]);
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          this.successMessage = '';
          console.error('Erreur de connexion:', error);
          
          // Messages d'erreur personnalisés
          if (error.status === 401) {
            this.errorMessage = 'Email ou mot de passe incorrect';
          } else if (error.status === 0) {
            this.errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
          } else {
            this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
    }
  }

  /**
   * Marque tous les champs du formulaire comme "touchés" 
   * pour afficher les erreurs de validation
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Navigation vers la page d'inscription
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Toggle pour afficher/masquer le mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Réinitialise les messages d'erreur/succès quand l'utilisateur modifie un champ
   */
  onFieldChange(): void {
    if (this.errorMessage || this.successMessage) {
      this.errorMessage = '';
      this.successMessage = '';
    }
  }
}