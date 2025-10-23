package com.covoiturage.covoiturage.dto;

import com.covoiturage.covoiturage.enums.Role;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserResponseDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String profilePicture;       // URL ou path
    private LocalDate dateOfBirth;
    private Boolean isVerified;
    private Double averageRating;
    private Integer totalRatings;
    private Role role;                  // ou un enum toString(); adapte selon ton modèle
    private LocalDateTime createdAt;
}