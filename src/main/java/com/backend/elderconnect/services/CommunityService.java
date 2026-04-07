package com.backend.elderconnect.services;

import com.backend.elderconnect.dto.CommunityResponseDTO;
import com.backend.elderconnect.dto.PostResponseDTO;
import com.backend.elderconnect.dto.UserProfileDTO;
import com.backend.elderconnect.entities.Community;
import com.backend.elderconnect.entities.CommunityType;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.repositories.CommunityRepository;
import com.backend.elderconnect.repositories.PostRepository;
import com.backend.elderconnect.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommunityService {
    @Autowired
    CommunityRepository communityRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PostRepository postRepository;

    public List<CommunityResponseDTO> getAllCommunities(String filter) {
        List<Community> communities;
        if ("official".equals(filter)) {
            communities = communityRepository.findAllOfficial();
        } else {
            // "popular" filter could be based on member count, for now just all
            communities = communityRepository.findAll();
        }

        return communities.stream()
                .map(this::mapCommunityToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunityResponseDTO createCommunity(String name, String description, CommunityType type) {
        if (communityRepository.findByName(name).isPresent()) {
            throw new RuntimeException("Error: Community name already exists.");
        }

        Community community = new Community();
        community.setName(name);
        community.setDescription(description);
        community.setType(type);
        
        String username = getCurrentUsername();
        User creator = userRepository.findByUsername(username).get();
        community.getModerators().add(creator);
        community.getMembers().add(creator);

        community = communityRepository.save(community);
        return mapCommunityToDTO(community);
    }

    public CommunityResponseDTO getCommunityDetail(String name) {
        Community community = communityRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));
        return mapCommunityToDTO(community);
    }

    @Transactional
    public void joinOrLeaveCommunity(Long id) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username).get();
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));

        if (community.getMembers().contains(user)) {
            community.getMembers().remove(user);
        } else {
            community.getMembers().add(user);
        }
        communityRepository.save(community);
    }

    public List<PostResponseDTO> getCommunityPosts(Long id, int page, int size) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findByCommunity(community, pageable).stream()
                .map(this::mapPostToDTO)
                .collect(Collectors.toList());
    }

    public List<UserProfileDTO> getCommunityMembers(Long id, int page, int size) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));
        
        // Members are a Set, pagination needs manual handling or custom query
        return community.getMembers().stream()
                .skip((long) page * size)
                .limit(size)
                .map(this::mapUserToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addOrRemoveModerator(Long communityId, Long userId, boolean add) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));
        
        // Check if current user is admin or moderator
        String currentUsername = getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername).get();
        
        // Custom logic: Only admin or existing moderator can add/remove moderators
        if (!community.getModerators().contains(currentUser)) {
             throw new RuntimeException("Error: Unauthorized.");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (add) {
            community.getModerators().add(targetUser);
        } else {
            community.getModerators().remove(targetUser);
        }
        communityRepository.save(community);
    }

    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }

    private CommunityResponseDTO mapCommunityToDTO(Community community) {
        String username = null;
        try {
            username = getCurrentUsername();
        } catch (Exception e) {}

        boolean isMember = false;
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                isMember = community.getMembers().contains(user);
            }
        }

        return CommunityResponseDTO.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .memberCount(community.getMembers().size())
                .isOfficial(community.isOfficial())
                .type(community.getType())
                .isUserMember(isMember)
                .build();
    }

    private PostResponseDTO mapPostToDTO(com.backend.elderconnect.entities.Post post) {
        return PostResponseDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .pictureUrl(post.getPictureUrl())
                .score(post.getScore())
                .createdAt(post.getCreatedAt())
                .authorName(post.getAuthor().getUsername())
                .isOfficialAuthor(post.getAuthor().isConfirmed())
                .commentCount((long) post.getComments().size())
                .originalPostId(post.getOriginalPost() != null ? post.getOriginalPost().getId() : null)
                .build();
    }

    private UserProfileDTO mapUserToDTO(User user) {
        return UserProfileDTO.builder()
                .username(user.getUsername())
                .name(user.getName())
                .surname(user.getSurname())
                .description(user.getDescription())
                .joinedAt(user.getJoinedAt())
                .isConfirmed(user.isConfirmed())
                .build();
    }
}
