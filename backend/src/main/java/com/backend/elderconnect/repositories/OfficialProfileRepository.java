package com.backend.elderconnect.repositories;

import com.backend.elderconnect.entities.OfficialProfile;
import com.backend.elderconnect.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfficialProfileRepository extends JpaRepository<OfficialProfile, Long> {
    Optional<OfficialProfile> findByUser(User user);
}
