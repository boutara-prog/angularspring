package com.covoiturage.covoiturage.Service;


import com.covoiturage.covoiturage.Entite.User;
import com.covoiturage.covoiturage.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String emailOrUsername) throws UsernameNotFoundException {
        logger.debug("Tentative de chargement de l'utilisateur: {}", emailOrUsername);

        User user = null;

        // Essayer d'abord de chercher par email
        try {
            user = userRepository.findByEmail(emailOrUsername)
                    .orElse(null);
            logger.debug("Recherche par email - résultat: {}", user != null ? "trouvé" : "non trouvé");
        } catch (Exception e) {
            logger.warn("Erreur lors de la recherche par email: {}", e.getMessage());
        }

        // Si pas trouvé par email, essayer par username
        if (user == null) {
            try {
                user = userRepository.findByUsername(emailOrUsername)
                        .orElse(null);
                logger.debug("Recherche par username - résultat: {}", user != null ? "trouvé" : "non trouvé");
            } catch (Exception e) {
                logger.warn("Erreur lors de la recherche par username: {}", e.getMessage());
            }
        }

        if (user == null) {
            logger.warn("Utilisateur non trouvé pour: {}", emailOrUsername);
            throw new UsernameNotFoundException("Utilisateur non trouvé avec l'identifiant: " + emailOrUsername);
        }

        logger.debug("Utilisateur trouvé: {} (ID: {})", user.getEmail(), user.getId());

        return createUserPrincipal(user);
    }
    private UserDetails createUserPrincipal(User user) {
        Collection<GrantedAuthority> authorities = getAuthorities(user);

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail()) // Important: utiliser l'email comme username
                .password(user.getPassword())
                .disabled(!user.isEnabled())
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .authorities(authorities)
                .build();
    }

    private Collection<GrantedAuthority> getAuthorities(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();

        // Ajouter le rôle de l'utilisateur
        if (user.getRole() != null) {
            String roleStr = user.getRole().toString(); // Convertir l'enum en String
            // S'assurer que le rôle commence par "ROLE_"
            String role = roleStr.startsWith("ROLE_") ? roleStr : "ROLE_" + roleStr;
            authorities.add(new SimpleGrantedAuthority(role));
            logger.debug("Rôle ajouté pour l'utilisateur {}: {}", user.getEmail(), role);
        } else {
            // Rôle par défaut
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            logger.debug("Rôle par défaut ajouté pour l'utilisateur {}: ROLE_USER", user.getEmail());
        }

        return authorities;
    }
}
