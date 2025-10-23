package com.covoiturage.covoiturage.dto;


import com.covoiturage.covoiturage.Entite.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String nom;
    private String prenom;
    private String telephone;
    private String adresse;
    private Role role;
    private String entreprise;   // Nouveau
}