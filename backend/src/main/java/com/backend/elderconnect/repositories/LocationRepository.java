package com.backend.elderconnect.repositories;

import com.backend.elderconnect.entities.Location;
import com.backend.elderconnect.entities.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByCity(String city);
    List<Location> findByCommunity(Community community);
}
