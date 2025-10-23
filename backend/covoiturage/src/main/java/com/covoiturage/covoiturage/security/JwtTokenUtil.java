package com.covoiturage.covoiturage.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class);
    public static final long JWT_TOKEN_VALIDITY = 5 * 60 * 60; // 5 heures

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        // Assurer que la clé fait au moins 64 caractères pour HS512
        String paddedSecret = secret;
        if (secret.length() < 64) {
            // Padder avec des caractères pour atteindre 64 caractères minimum
            StringBuilder sb = new StringBuilder(secret);
            while (sb.length() < 64) {
                sb.append("0123456789abcdef");
            }
            paddedSecret = sb.substring(0, 64);
            logger.warn("Clé JWT étendue pour respecter les exigences HS512");
        }
        return Keys.hmacShaKeyFor(paddedSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String getUsernameFromToken(String token) {
        try {
            return getClaimFromToken(token, Claims::getSubject);
        } catch (Exception e) {
            logger.error("Erreur lors de l'extraction du username du token", e);
            throw e;
        }
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            logger.warn("Token JWT expiré: {}", e.getMessage());
            throw e;
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT non supporté: {}", e.getMessage());
            throw e;
        } catch (MalformedJwtException e) {
            logger.error("Token JWT malformé: {}", e.getMessage());
            throw e;
        } catch (SecurityException e) {
            logger.error("Erreur de sécurité JWT: {}", e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            logger.error("Token JWT vide: {}", e.getMessage());
            throw e;
        }
    }

    private Boolean isTokenExpired(String token) {
        try {
            final Date expiration = getExpirationDateFromToken(token);
            return expiration.before(new Date());
        } catch (Exception e) {
            logger.error("Erreur lors de la vérification de l'expiration du token", e);
            return true; // Considérer comme expiré en cas d'erreur
        }
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Ajouter des claims supplémentaires si nécessaire
        claims.put("email", userDetails.getUsername()); // Username est l'email
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        try {
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(subject)
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY * 1000))
                    .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                    .compact();
        } catch (Exception e) {
            logger.error("Erreur lors de la création du token JWT", e);
            throw new RuntimeException("Impossible de créer le token JWT", e);
        }
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = getUsernameFromToken(token);
            boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
            logger.debug("Validation du token pour {}: {}", username, isValid);
            return isValid;
        } catch (Exception e) {
            logger.error("Erreur lors de la validation du token", e);
            return false;
        }
    }
}