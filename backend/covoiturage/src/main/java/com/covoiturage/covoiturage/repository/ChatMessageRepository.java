package com.covoiturage.covoiturage.repository;

import com.covoiturage.covoiturage.Entite.ChatMessage;
import com.covoiturage.covoiturage.Entite.Trip;
import com.covoiturage.covoiturage.Entite.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByTripOrderByCreatedAtAsc(Trip trip);

    List<ChatMessage> findByTripOrderByCreatedAtDesc(Trip trip);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.trip = :trip AND cm.sender = :sender ORDER BY cm.createdAt DESC")
    List<ChatMessage> findByTripAndSenderOrderByCreatedAtDesc(@Param("trip") Trip trip, @Param("sender") User sender);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.trip = :trip AND cm.sender != :user AND cm.isRead = false")
    int countUnreadMessagesForUser(@Param("trip") Trip trip, @Param("user") User user);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.trip = :trip AND cm.isRead = false AND cm.sender != :user")
    List<ChatMessage> findUnreadMessagesForUser(@Param("trip") Trip trip, @Param("user") User user);

    @Query("SELECT DISTINCT cm.trip FROM ChatMessage cm WHERE cm.sender = :user OR " +
            "(cm.trip.driver = :user OR EXISTS(SELECT b FROM Booking b WHERE b.trip = cm.trip AND b.passenger = :user))")
    List<Trip> findTripsWithMessagesForUser(@Param("user") User user);
}
