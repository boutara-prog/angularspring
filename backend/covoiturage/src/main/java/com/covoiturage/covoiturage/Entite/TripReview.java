package com.covoiturage.covoiturage.Entite;
import com.covoiturage.covoiturage.enums.ReviewType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
// TripReview.java
@Entity
@Table(name = "trip_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_user_id")
    private User reviewedUser;

    private Integer rating; // 1-5
    private String comment;

    @Enumerated(EnumType.STRING)
    private ReviewType type; // DRIVER_TO_PASSENGER, PASSENGER_TO_DRIVER

    @CreationTimestamp
    private LocalDateTime createdAt;
}