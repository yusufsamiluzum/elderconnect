package com.backend.elderconnect.repositories;

import com.backend.elderconnect.entities.CommunityRequest;
import com.backend.elderconnect.entities.CommunityRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRequestRepository extends JpaRepository<CommunityRequest, Long> {
    
    Optional<CommunityRequest> findByCommunityIdAndUserId(Long communityId, Long userId);
    
    List<CommunityRequest> findByCommunityIdAndStatus(Long communityId, CommunityRequestStatus status);
}
