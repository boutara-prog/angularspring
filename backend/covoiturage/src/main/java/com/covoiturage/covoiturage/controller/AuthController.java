package com.covoiturage.covoiturage.controller;

import com.covoiturage.covoiturage.Entite.Fournisseur;
import com.covoiturage.covoiturage.Entite.User;
import com.covoiturage.covoiturage.Service.FournisseurService;
import com.covoiturage.covoiturage.Service.UserService;
import com.covoiturage.covoiturage.dto.JwtResponse;
import com.covoiturage.covoiturage.dto.LoginRequest;
import com.covoiturage.covoiturage.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;
    // ✅ INJECTION du FournisseurService
    @Autowired
    private FournisseurService fournisseurService;
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Tentative de connexion pour l'email: {}", loginRequest.getEmail());

            // Validation des données d'entrée
            if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty()) {
                logger.warn("Email manquant dans la requête de login");
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Email requis", "MISSING_EMAIL"));
            }

            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                logger.warn("Mot de passe manquant dans la requête de login");
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Mot de passe requis", "MISSING_PASSWORD"));
            }

            JwtResponse jwtResponse = userService.authenticateUser(loginRequest);
            logger.info("Connexion réussie pour l'email: {}", loginRequest.getEmail());
            return ResponseEntity.ok(jwtResponse);

        } catch (IllegalArgumentException e) {
            logger.warn("Identifiants invalides pour l'email: {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Email ou mot de passe incorrect", "INVALID_CREDENTIALS"));

        } catch (RuntimeException e) {
            logger.error("Erreur lors de l'authentification pour l'email: {}",
                    loginRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur interne du serveur", "INTERNAL_ERROR"));

        } catch (Exception e) {
            logger.error("Erreur inattendue lors de l'authentification pour l'email: {}",
                    loginRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur inattendue", "UNEXPECTED_ERROR"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        try {
            logger.info("Tentative d'inscription pour l'email: {}", signUpRequest.getEmail());

            // Validation des données d'entrée
            if (signUpRequest.getEmail() == null || signUpRequest.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Email requis", "MISSING_EMAIL"));
            }

            if (signUpRequest.getPassword() == null || signUpRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Mot de passe requis", "MISSING_PASSWORD"));
            }

            if (signUpRequest.getNom() == null || signUpRequest.getNom().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Nom requis", "MISSING_NAME"));
            }

            if (signUpRequest.getPrenom() == null || signUpRequest.getPrenom().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Prénom requis", "MISSING_FIRSTNAME"));
            }

            User user = userService.registerUser(signUpRequest);
            logger.info("Inscription réussie pour l'email: {}", signUpRequest.getEmail());
            return ResponseEntity.ok(user);

        } catch (IllegalArgumentException e) {
            logger.warn("Données d'inscription invalides pour l'email: {}", signUpRequest.getEmail());
            return ResponseEntity.badRequest()
                    .body(createErrorResponse(e.getMessage(), "INVALID_DATA"));

        } catch (RuntimeException e) {
            if (e.getMessage().contains("existe déjà")) {
                logger.warn("Tentative d'inscription avec un email existant: {}", signUpRequest.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(createErrorResponse("Un compte existe déjà avec cet email", "EMAIL_EXISTS"));
            }

            logger.error("Erreur lors de l'inscription pour l'email: {}", signUpRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur interne du serveur", "INTERNAL_ERROR"));

        } catch (Exception e) {
            logger.error("Erreur inattendue lors de l'inscription pour l'email: {}",
                    signUpRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur inattendue", "UNEXPECTED_ERROR"));
        }
    }


    // ✅ NOUVEAU ENDPOINT pour inscription fournisseur
    @PostMapping("/register/fournisseur")
    public ResponseEntity<?> registerFournisseur(@RequestBody RegisterRequest request) {
        try {
            // 1. Créer d'abord l'utilisateur
            User user = userService.registerUser(request);

            // 2. Créer ensuite le fournisseur avec les infos supplémentaires
            Fournisseur fournisseur = new Fournisseur();
            fournisseur.setNom(request.getNom());
            fournisseur.setPrenom(request.getPrenom());
            fournisseur.setEmail(request.getEmail());
            fournisseur.setTelephone(request.getTelephone() != null ? request.getTelephone() : "");
            fournisseur.setAdresse(request.getAdresse() != null ? request.getAdresse() : "");
            fournisseur.setEntreprise(request.getEntreprise() != null ? request.getEntreprise() : "");

            // Lier le fournisseur à l'utilisateur
            fournisseur.setUserId(user.getId());

            // ✅ Utiliser le service injecté (non static)
            Fournisseur savedFournisseur = fournisseurService.saveFournisseur(fournisseur);

            return ResponseEntity.ok(Map.of(
                    "message", "Fournisseur inscrit avec succès",
                    "userId", user.getId(),
                    "fournisseurId", savedFournisseur.getIdFour()
            ));
        } catch (Exception e) {
            e.printStackTrace(); // Pour voir l'erreur complète dans les logs
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Méthode utilitaire pour créer une réponse d'erreur standardisée
     */
    private Map<String, Object> createErrorResponse(String message, String code) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", true);
        errorResponse.put("message", message);
        errorResponse.put("code", code);
        errorResponse.put("timestamp", System.currentTimeMillis());
        return errorResponse;
    }

    /**
     * Endpoint de test pour vérifier que l'API fonctionne
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Auth API is running");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}