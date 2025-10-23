package com.covoiturage.covoiturage.repository;

import com.covoiturage.covoiturage.Entite.Trip;
import com.covoiturage.covoiturage.Entite.TripReview;
import com.covoiturage.covoiturage.Entite.User;
import com.covoiturage.covoiturage.enums.ReviewType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripReviewRepository extends JpaRepository<TripReview, Long> {

    List<TripReview> findByReviewedUserOrderByCreatedAtDesc(User reviewedUser);

    List<TripReview> findByReviewerOrderByCreatedAtDesc(User reviewer);

    List<TripReview> findByTripOrderByCreatedAtDesc(Trip trip);

    Optional<TripReview> findByTripAndReviewerAndReviewedUser(Trip trip, User reviewer, User reviewedUser);

    boolean existsByTripAndReviewerAndReviewedUser(Trip trip, User reviewer, User reviewedUser);

    @Query("SELECT AVG(tr.rating) FROM TripReview tr WHERE tr.reviewedUser = :user")
    Double findAverageRatingForUser(@Param("user") User user);

    @Query("SELECT AVG(tr.rating) FROM TripReview tr WHERE tr.reviewedUser = :user AND tr.type = :type")
    Double findAverageRatingForUserByType(@Param("user") User user, @Param("type") ReviewType type);

    @Query("SELECT COUNT(tr) FROM TripReview tr WHERE tr.reviewedUser = :user")
    int countReviewsForUser(@Param("user") User user);

    @Query("SELECT COUNT(tr) FROM TripReview tr WHERE tr.reviewedUser = :user AND tr.type = :type")
    int countReviewsForUserByType(@Param("user") User user, @Param("type") ReviewType type);

    @Query("SELECT tr FROM TripReview tr WHERE tr.reviewedUser = :user AND tr.rating >= :minRating ORDER BY tr.createdAt DESC")
    List<TripReview> findPositiveReviewsForUser(@Param("user") User user, @Param("minRating") int minRating);

    List<TripReview> findByTypeOrderByCreatedAtDesc(ReviewType type);

    @Query("SELECT tr FROM TripReview tr WHERE tr.trip = :trip AND tr.type = :type")
    List<TripReview> findByTripAndType(@Param("trip") Trip trip, @Param("type") ReviewType type);

    @Query("SELECT tr FROM TripReview tr WHERE tr.reviewer = :reviewer AND tr.type = :type ORDER BY tr.createdAt DESC")
    List<TripReview> findByReviewerAndTypeOrderByCreatedAtDesc(@Param("reviewer") User reviewer, @Param("type") ReviewType type);

    @Query("SELECT tr FROM TripReview tr WHERE tr.reviewedUser = :user AND tr.type = :type ORDER BY tr.createdAt DESC")
    List<TripReview> findByReviewedUserAndTypeOrderByCreatedAtDesc(@Param("user") User user, @Param("type") ReviewType type);
}
