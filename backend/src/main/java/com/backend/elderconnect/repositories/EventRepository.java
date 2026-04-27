package com.backend.elderconnect.repositories;

import com.backend.elderconnect.entities.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    @Query("SELECT e FROM Event e WHERE e.eventDate > CURRENT_TIMESTAMP ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEvents();

    @Query("SELECT DISTINCT e FROM Event e WHERE " +
           "(LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.keywords) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "e.eventDate > CURRENT_TIMESTAMP")
    List<Event> findByKeyword(String keyword);

    List<Event> findByParticipantsContaining(com.backend.elderconnect.entities.User user);
}
