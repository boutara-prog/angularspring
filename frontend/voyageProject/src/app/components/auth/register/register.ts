import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService.service';
import { RegisterRequest } from '../../../services/AuthService.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      userType: ['', [Validators.required]],
      telephone: [''],
      adresse: [''],
      entreprise: ['']
    }, { validators: this.passwordMatchValidator });

    this.registerForm.get('userType')?.valueChanges.subscribe(userType => {
      this.updateValidators(userType);
    });
  }

  get isFournisseur(): boolean {
    return this.registerForm.get('userType')?.value === 'FOURNISSEUR';
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  updateValidators(userType: string): void {
    const telephoneControl = this.registerForm.get('telephone');
    const adresseControl = this.registerForm.get('adresse');
    const entrepriseControl = this.registerForm.get('entreprise');

    if (userType === 'FOURNISSEUR') {
      telephoneControl?.setValidators([Validators.required]);
      adresseControl?.clearValidators(); // Optionnel
      entrepriseControl?.clearValidators(); // Optionnel
    } else {
      telephoneControl?.clearValidators();
      adresseControl?.clearValidators();
      entrepriseControl?.clearValidators();
    }

    telephoneControl?.updateValueAndValidity();
    adresseControl?.updateValueAndValidity();
    entrepriseControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const userType = this.registerForm.get('userType')?.value;

      if (userType === 'CLIENT') {
        this.registerClient();
      } else if (userType === 'FOURNISSEUR') {
        this.registerFournisseur();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private registerClient(): void {
    const userData: RegisterRequest = {
      nom: this.registerForm.get('nom')?.value,
      username: this.registerForm.get('nom')?.value,
      prenom: this.registerForm.get('prenom')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      telephone: this.registerForm.get('telephone')?.value || '',
      role: this.registerForm.get('userType')?.value
    };

    console.log('Données CLIENT:', userData);

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Inscription réussie! Vous pouvez maintenant vous connecter.';
        console.log('Inscription client réussie:', response);
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur inscription client:', error);
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  private registerFournisseur(): void {
    // Inclure TOUS les champs, même si vides
    const userData: RegisterRequest = {
      nom: this.registerForm.get('nom')?.value,
      username: this.registerForm.get('nom')?.value,
      prenom: this.registerForm.get('prenom')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      telephone: this.registerForm.get('telephone')?.value,
      role: this.registerForm.get('userType')?.value,
      adresse: this.registerForm.get('adresse')?.value || '', // Envoyer chaîne vide si non rempli
      entreprise: this.registerForm.get('entreprise')?.value || '' // Envoyer chaîne vide si non rempli
    };

    console.log('Données FOURNISSEUR:', userData);

    this.authService.registerFournisseur(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Inscription fournisseur réussie! Vous pouvez maintenant vous connecter.';
        console.log('Inscription fournisseur réussie:', response);
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur inscription fournisseur:', error);
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 400) {
      return 'Données invalides. Vérifiez tous les champs.';
    } else if (error.status === 409) {
      return 'Cet email est déjà utilisé.';
    } else if (error.status === 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    return 'Erreur lors de l\'inscription. Veuillez réessayer.';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}