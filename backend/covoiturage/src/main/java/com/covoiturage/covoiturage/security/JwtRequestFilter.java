package com.covoiturage.covoiturage.security;

import com.covoiturage.covoiturage.Service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");
        final String requestURI = request.getRequestURI();

        logger.info("=== JWT Filter - URI: {} ===", requestURI);
        logger.info("Authorization Header: {}", requestTokenHeader != null ? "Bearer ***" : "null");

        String username = null;
        String jwtToken = null;

        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            logger.info("JWT Token extrait: {}", jwtToken.substring(0, Math.min(20, jwtToken.length())) + "...");

            try {
                username = jwtTokenUtil.getUsernameFromToken(jwtToken);
                logger.info("Username extrait du token: {}", username);
            } catch (Exception e) {
                logger.error("Erreur lors de l'extraction du username du JWT: {}", e.getMessage());
                logger.error("Token problématique: {}", jwtToken);
            }
        } else {
            logger.warn("Header Authorization manquant ou format incorrect");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            logger.info("Tentative de validation du token pour l'utilisateur: {}", username);

            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                logger.info("UserDetails chargé pour {}: authorities = {}",
                        username, userDetails.getAuthorities());

                if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
                    logger.info("Token valide pour l'utilisateur: {}", username);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    logger.info("Authentification réussie pour {} avec authorities: {}",
                            username, userDetails.getAuthorities());
                } else {
                    logger.warn("Token invalide pour l'utilisateur: {}", username);
                }
            } catch (Exception e) {
                logger.error("Erreur lors de la validation du token pour {}: {}", username, e.getMessage());
            }
        } else if (username == null) {
            logger.info("Pas de username trouvé dans le token");
        } else {
            logger.info("Utilisateur {} déjà authentifié", username);
        }

        // Vérifier l'état final de l'authentification
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            logger.info("Context de sécurité: Authentifié = {}",
                    SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
            logger.info("Authorities finales: {}",
                    SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        } else {
            logger.warn("Context de sécurité: NON AUTHENTIFIÉ");
        }

        chain.doFilter(request, response);
    }
}