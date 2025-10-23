package com.covoiturage.covoiturage.repository;


import com.covoiturage.covoiturage.Entite.Trip;
import com.covoiturage.covoiturage.Entite.User;
import com.covoiturage.covoiturage.enums.TripStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    @Query("SELECT t FROM Trip t WHERE " +
            "t.departureCity = :departureCity AND " +
            "t.arrivalCity = :arrivalCity AND " +
            "t.departureTime BETWEEN :startDate AND :endDate AND " +
            "t.availableSeats >= :passengers AND " +
            "t.status = 'ACTIVE' " +
            "ORDER BY t.departureTime ASC")
    Page<Trip> findAvailableTrips(@Param("departureCity") String departureCity,
                                  @Param("arrivalCity") String arrivalCity,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate,
                                  @Param("passengers") Integer passengers,
                                  Pageable pageable);

    List<Trip> findByDriverOrderByDepartureTimeDesc(User driver);

    @Query("SELECT t FROM Trip t WHERE t.driver = :driver AND t.status IN :statuses")
    List<Trip> findByDriverAndStatusIn(@Param("driver") User driver,
                                       @Param("statuses") List<TripStatus> statuses);

    @Query("SELECT t FROM Trip t WHERE t.departureTime BETWEEN :start AND :end")
    List<Trip> findByDepartureTimeBetween(@Param("start") LocalDateTime start,
                                          @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.driver = :driver AND t.status = 'ACTIVE'")
    int countActiveTripsForDriver(@Param("driver") User driver);
}
