package com.backend.elderconnect.repositories;

import com.backend.elderconnect.entities.Community;
import com.backend.elderconnect.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findByName(String name);
    
    @Query("SELECT c FROM Community c WHERE c.name LIKE %:query% OR c.description LIKE %:query%")
    List<Community> searchCommunities(String query);

    List<Community> findByMembersContaining(User user);
}
