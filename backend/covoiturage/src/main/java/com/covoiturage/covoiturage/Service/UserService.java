package com.covoiturage.covoiturage.Service;

import com.covoiturage.covoiturage.Entite.Client;
import com.covoiturage.covoiturage.Entite.Fournisseur;
import com.covoiturage.covoiturage.Entite.User;
import com.covoiturage.covoiturage.dto.JwtResponse;
import com.covoiturage.covoiturage.dto.LoginRequest;
import com.covoiturage.covoiturage.dto.RegisterRequest;
import com.covoiturage.covoiturage.repository.UserRepository;
import com.covoiturage.covoiturage.security.JwtTokenUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private FournisseurService fournisseurService;

    @Autowired
    private ClientService clientService; // Ajouter ClientService

    @Transactional
    public User registerUser(RegisterRequest request) {
        logger.info("Tentative d'inscription pour email: {}", request.getEmail());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setTelephone(request.getTelephone());
        user.setAdresse(request.getAdresse());
        user.setEnabled(true);
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);
        logger.info("User créé avec succès: {}", savedUser.getEmail());
        String roleString = user.getRole() != null ? user.getRole().toString() : null;

        if ("CLIENT".equalsIgnoreCase(roleString)) {
        // Créer automatiquement un Client si le rôle est CLIENT

            Client client = new Client();
            client.setNom(savedUser.getNom());
            client.setPrenom(savedUser.getPrenom());
            client.setEmail(savedUser.getEmail());
            client.setTelephone(savedUser.getTelephone());
            client.setAdresse(savedUser.getAdresse());

            Client savedClient = clientService.saveClient(client);
            logger.info("Client créé avec idClient: {}", savedClient.getIdClient());
        }

        return savedUser;
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        try {
            logger.info("Tentative d'authentification pour email: {}", loginRequest.getEmail());

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword())
            );

            final UserDetails userDetails = userDetailsService
                    .loadUserByUsername(loginRequest.getEmail());

            final String token = jwtTokenUtil.generateToken(userDetails);

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé après authentification"));

            logger.info("Authentification réussie pour email: {}", loginRequest.getEmail());

            Long idFour = null;
            Long idClient = null;
            String roleString = user.getRole() != null ? user.getRole().toString() : null;

            // Récupérer idFour si FOURNISSEUR
            if ("FOURNISSEUR".equalsIgnoreCase(roleString)) {
                Optional<Fournisseur> fournisseur = fournisseurService.getFournisseurByEmail(user.getEmail());
                if (fournisseur.isPresent()) {
                    idFour = fournisseur.get().getIdFour();
                    logger.info("Fournisseur trouvé avec idFour: {}", idFour);
                }
            }

            // Récupérer idClient si CLIENT
            if ("CLIENT".equalsIgnoreCase(roleString)) {
                Optional<Client> client = clientService.getClientByEmail(user.getEmail());
                if (client.isPresent()) {
                    idClient = client.get().getIdClient();
                    logger.info("Client trouvé avec idClient: {}", idClient);
                } else {
                    idClient = 1L;
                    logger.warn("Aucun client trouvé pour l'email: {}", user.getEmail());
                }
            }

            return new JwtResponse(
                    token,
                    user.getId(),
                    user.getEmail(),
                    user.getNom(),
                    user.getPrenom(),
                    roleString,
                    idFour,
                    idClient  // Ajouter idClient
            );

        } catch (DisabledException e) {
            logger.warn("Compte désactivé pour email: {}", loginRequest.getEmail());
            throw new RuntimeException("USER_DISABLED");
        } catch (BadCredentialsException e) {
            logger.warn("Identifiants invalides pour email: {}", loginRequest.getEmail());
            throw new RuntimeException("INVALID_CREDENTIALS");
        } catch (Exception e) {
            logger.error("Erreur lors de l'authentification pour email: {}", loginRequest.getEmail(), e);
            throw new RuntimeException("AUTHENTICATION_ERROR");
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}