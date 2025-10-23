package com.covoiturage.covoiturage.Entite;

import com.covoiturage.covoiturage.enums.TripStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private User driver;

    private String departureCity;
    private String arrivalCity;
    private String departureAddress;
    private String arrivalAddress;
    private Double departureLat;
    private Double departureLng;
    private Double arrivalLat;
    private Double arrivalLng;

    private LocalDateTime departureTime;
    private LocalDateTime estimatedArrivalTime;

    private BigDecimal pricePerSeat;
    private Integer availableSeats;
    private Integer totalSeats;

    private String description;
    private Boolean smokingAllowed = false;
    private Boolean petsAllowed = false;
    private Boolean musicAllowed = true;

    @Enumerated(EnumType.STRING)
    private TripStatus status = TripStatus.ACTIVE;

    private String carModel;
    private String carColor;
    private String licensePlate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL)
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL)
    private List<TripReview> reviews = new ArrayList<>();
}