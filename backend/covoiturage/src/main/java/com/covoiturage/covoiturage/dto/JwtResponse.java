package com.covoiturage.covoiturage.dto;

public class JwtResponse {
    private String token;
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String role;
    private Long idFour; // Pour les fournisseurs
    private Long idClient; // Pour les clients

    public JwtResponse(String token, Long id, String email, String nom, String prenom,
                       String role, Long idFour, Long idClient) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.role = role;
        this.idFour = idFour;
        this.idClient = idClient;
    }

    // Constructeur sans paramètres (requis pour Jackson)
    public JwtResponse() {
    }

    // Getters et Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getIdFour() {
        return idFour;
    }

    public void setIdFour(Long idFour) {
        this.idFour = idFour;
    }

    // ✅ AJOUTEZ CES DEUX MÉTHODES MANQUANTES
    public Long getIdClient() {
        return idClient;
    }

    public void setIdClient(Long idClient) {
        this.idClient = idClient;
    }
}