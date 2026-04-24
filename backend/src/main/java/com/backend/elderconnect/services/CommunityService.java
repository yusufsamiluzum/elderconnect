package com.backend.elderconnect.services;

import com.backend.elderconnect.dto.CommunityResponseDTO;
import com.backend.elderconnect.dto.JoinRequestDTO;
import com.backend.elderconnect.dto.PostResponseDTO;
import com.backend.elderconnect.dto.UserProfileDTO;
import com.backend.elderconnect.entities.Community;
import com.backend.elderconnect.entities.CommunityType;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.entities.CommunityRequest;
import com.backend.elderconnect.entities.CommunityRequestStatus;
import com.backend.elderconnect.repositories.CommunityRepository;
import com.backend.elderconnect.repositories.CommunityRequestRepository;
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
    CommunityRequestRepository communityRequestRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PostRepository postRepository;

    @Transactional(readOnly = true)
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
        community.setOwner(creator);
        community.getModerators().add(creator);
        community.getMembers().add(creator);

        community = communityRepository.save(community);
        return mapCommunityToDTO(community);
    }

    @Transactional(readOnly = true)
    public CommunityResponseDTO getCommunityDetail(String name) {
        Community community = communityRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));
        return mapCommunityToDTO(community);
    }

    @Transactional(readOnly = true)
    public CommunityResponseDTO getCommunityById(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));
        return mapCommunityToDTO(community);
    }

    @Transactional(readOnly = true)
    public List<CommunityResponseDTO> getMyCommunities() {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        return communityRepository.findByMembersContaining(user).stream()
                .map(this::mapCommunityToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public String joinCommunity(Long id) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Hata: Kullanıcı bulunamadı."));
                
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hata: Topluluk bulunamadı."));

        if (community.getMembers().contains(user)) {
             throw new RuntimeException("Hata: Zaten bu topluluğun üyesisiniz.");
        }

        // Halka açık topluluklar için doğrudan katılma
        if (community.getType() == CommunityType.PUBLIC) {
            community.getMembers().add(user);
            communityRepository.save(community);
            // Varsa bekleyen isteği temizle
            communityRequestRepository.findByCommunityIdAndUserId(id, user.getId())
                .ifPresent(req -> communityRequestRepository.delete(req));
            return "Topluluğa başarıyla katıldınız!";
        }

        // Gizli topluluklar için istek oluşturma
        if (communityRequestRepository.findByCommunityIdAndUserId(id, user.getId()).isPresent()) {
             throw new RuntimeException("Hata: Zaten bir katılım isteğiniz bulunuyor.");
        }

        CommunityRequest req = new CommunityRequest();
        req.setCommunity(community);
        req.setUser(user);
        req.setStatus(CommunityRequestStatus.PENDING);
        communityRequestRepository.save(req);
        return "Katılım isteğiniz yöneticiye iletildi.";
    }

    @Transactional
    public void leaveCommunity(Long id) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username).get();
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));

        if (community.getMembers().contains(user)) {
            community.getMembers().remove(user);
        }
        communityRepository.save(community);
    }

    @Transactional(readOnly = true)
    public List<JoinRequestDTO> getPendingRequests(Long communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));

        String username = getCurrentUsername();
        User currentUser = userRepository.findByUsername(username).get();
        if (!community.getModerators().contains(currentUser)) {
            throw new RuntimeException("Error: Unauthorized. Only community admin can view requests.");
        }

        return communityRequestRepository.findByCommunityIdAndStatus(communityId, CommunityRequestStatus.PENDING).stream()
                .map(req -> JoinRequestDTO.builder()
                        .requestId(req.getId())
                        .userId(req.getUser().getId())
                        .username(req.getUser().getUsername())
                        .name(req.getUser().getName())
                        .surname(req.getUser().getSurname())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void handleJoinRequest(Long communityId, Long requestId, boolean approved) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));
        
        String username = getCurrentUsername();
        User currentUser = userRepository.findByUsername(username).get();
        if (!community.getModerators().contains(currentUser)) {
            throw new RuntimeException("Error: Unauthorized. Only community admin can handle requests.");
        }

        CommunityRequest req = communityRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Error: Request not found."));

        if (!req.getCommunity().getId().equals(communityId)) {
            throw new RuntimeException("Error: Request does not belong to this community.");
        }

        if (approved) {
            req.setStatus(CommunityRequestStatus.APPROVED);
            community.getMembers().add(req.getUser());
            communityRepository.save(community);
        } else {
            req.setStatus(CommunityRequestStatus.REJECTED);
        }
        communityRequestRepository.save(req);
    }

    @Transactional(readOnly = true)
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
        boolean isModerator = false;
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                isMember = community.getMembers().contains(user);
                isModerator = community.getModerators().contains(user);
            }
        }

        return CommunityResponseDTO.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .memberCount(community.getMembers().size())
                .isOfficial(community.isOfficial())
                .type(community.getType())
                .ownerName(community.getOwner() != null ? community.getOwner().getUsername() : null)
                .isUserMember(isMember)
                .isUserModerator(isModerator)
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
                .isOfficialAuthor(post.getAuthor().isApproved())
                .commentCount((long) post.getComments().size())
                .originalPostId(post.getOriginalPost() != null ? post.getOriginalPost().getId() : null)
                .build();
    }

    private UserProfileDTO mapUserToDTO(User user) {
        return UserProfileDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .surname(user.getSurname())
                .description(user.getDescription())
                .joinedAt(user.getJoinedAt())
                .isApproved(user.isApproved())
                .build();
    }
}
