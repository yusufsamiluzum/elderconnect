package com.backend.elderconnect.controllers;

import com.backend.elderconnect.dto.PostResponseDTO;
import com.backend.elderconnect.dto.EventResponseDTO;
import com.backend.elderconnect.entities.Event;
import com.backend.elderconnect.entities.Post;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.entities.UserRole;
import com.backend.elderconnect.repositories.PostVoteRepository;
import com.backend.elderconnect.repositories.UserRepository;
import com.backend.elderconnect.services.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserRepository userRepository;
    private final PostVoteRepository postVoteRepository;

    @GetMapping("/posts")
    public ResponseEntity<List<PostResponseDTO>> getRecommendedPosts(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Post> recommendedPosts = recommendationService.getRecommendedPosts(user);
        
        List<PostResponseDTO> dtos = recommendedPosts.stream()
                .map(post -> mapPostToDTO(post, user))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventResponseDTO>> getRecommendedEvents(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Event> recommendedEvents = recommendationService.getRecommendedEvents(user);
        
        List<EventResponseDTO> dtos = recommendedEvents.stream()
                .map(this::mapEventToDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/update-interests")
    public ResponseEntity<String> updateInterests(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        recommendationService.updateUserInterests(user);
        return ResponseEntity.ok("Interests updated successfully");
    }

    private PostResponseDTO mapPostToDTO(Post post, User currentUser) {
        String userVote = postVoteRepository.findByPostAndUser(post, currentUser)
                .map(vote -> vote.getVoteType().name())
                .orElse(null);

        return PostResponseDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .pictureUrl(post.getPictureUrl())
                .score(post.getScore())
                .createdAt(post.getCreatedAt())
                .authorName(post.getAuthor() != null ? post.getAuthor().getUsername() : "Bilinmeyen")
                .isOfficialAuthor(post.getAuthor() != null && post.getAuthor().getRoles().contains(UserRole.ROLE_OFFICIAL))
                .commentCount((long) (post.getComments() != null ? post.getComments().size() : 0))
                .userVote(userVote)
                .communityId(post.getCommunity() != null ? post.getCommunity().getId() : null)
                .communityName(post.getCommunity() != null ? post.getCommunity().getName() : null)
                .build();
    }

    private EventResponseDTO mapEventToDTO(Event event) {
        return EventResponseDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .locationName(event.getLocationName())
                .address(event.getAddress())
                .organizerName(event.getOrganizer() != null ? event.getOrganizer().getName() : "Bilinmeyen")
                .participantCount(event.getParticipants() != null ? event.getParticipants().size() : 0)
                .build();
    }
}
