package com.covoiturage.covoiturage.repository;

import com.covoiturage.covoiturage.Entite.Booking;
import com.covoiturage.covoiturage.Entite.Trip;
import com.covoiturage.covoiturage.Entite.User;
import com.covoiturage.covoiturage.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByPassengerOrderByCreatedAtDesc(User passenger);

    List<Booking> findByTrip(Trip trip);

    List<Booking> findByTripAndStatus(Trip trip, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.trip.driver = :driver AND b.status = 'PENDING' ORDER BY b.createdAt DESC")
    List<Booking> findPendingRequestsForDriver(@Param("driver") User driver);

    boolean existsByTripAndPassengerAndStatusIn(Trip trip, User passenger, List<BookingStatus> statuses);

    @Query("SELECT COALESCE(SUM(b.seatsBooked), 0) FROM Booking b WHERE b.trip = :trip AND b.status = 'CONFIRMED'")
    int countConfirmedSeatsByTrip(@Param("trip") Trip trip);

    @Query("SELECT b FROM Booking b WHERE b.passenger = :passenger AND b.status IN :statuses")
    List<Booking> findByPassengerAndStatusIn(@Param("passenger") User passenger,
                                             @Param("statuses") List<BookingStatus> statuses);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.passenger = :passenger AND b.status = 'CONFIRMED'")
    int countConfirmedBookingsForPassenger(@Param("passenger") User passenger);

    @Query("SELECT b FROM Booking b WHERE b.trip = :trip AND b.passenger = :passenger")
    Optional<Booking> findByTripAndPassenger(@Param("trip") Trip trip, @Param("passenger") User passenger);
}
