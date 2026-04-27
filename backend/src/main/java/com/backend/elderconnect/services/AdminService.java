package com.backend.elderconnect.services;

import com.backend.elderconnect.dto.AdminUserListDTO;
import com.backend.elderconnect.dto.ApprovalDecisionDTO;
import com.backend.elderconnect.dto.MessageResponse;
import com.backend.elderconnect.dto.OfficialApplicationDTO;
import com.backend.elderconnect.entities.OfficialProfile;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.entities.UserRole;
import com.backend.elderconnect.repositories.OfficialProfileRepository;
import com.backend.elderconnect.repositories.PostRepository;
import com.backend.elderconnect.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PostRepository postRepository;

    @Autowired
    OfficialProfileRepository officialProfileRepository;

    private void ensureAdmin() {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        if (!user.getRoles().contains(UserRole.ROLE_ADMIN)) {
            throw new RuntimeException("Error: Unauthorized. Super Admin access required.");
        }
    }

    public List<OfficialApplicationDTO> getPendingOfficials() {
        ensureAdmin();
        return officialProfileRepository.findAll().stream()
                .filter(p -> !p.getUser().isApproved() && p.getRejectionReason() == null)
                .map(this::mapProfileToApplicationDTO)
                .collect(Collectors.toList());
    }

    public List<OfficialApplicationDTO> getApprovedOfficials() {
        ensureAdmin();
        return officialProfileRepository.findAll().stream()
                .filter(p -> p.getUser().isApproved())
                .map(this::mapProfileToApplicationDTO)
                .collect(Collectors.toList());
    }

    public List<AdminUserListDTO> getAllUsers() {
        ensureAdmin();
        return userRepository.findAll().stream()
                .filter(u -> !u.getRoles().contains(UserRole.ROLE_ADMIN))
                .map(this::mapUserToListDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse approveOfficial(Long userId, ApprovalDecisionDTO decision) {
        ensureAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!user.getRoles().contains(UserRole.ROLE_OFFICIAL)) {
            throw new RuntimeException("Error: User is not an official account.");
        }

        OfficialProfile profile = officialProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Error: Official profile not found."));

        if (decision.isApprove()) {
            user.setApproved(true);
            userRepository.save(user);
            profile.setApprovedAt(LocalDateTime.now());
            officialProfileRepository.save(profile);
            return new MessageResponse("Resmi hesap başarıyla onaylandı.");
        } else {
            profile.setRejectionReason(
                    decision.getRejectionReason() != null ? decision.getRejectionReason() : "Belirtilmedi."
            );
            officialProfileRepository.save(profile);
            return new MessageResponse("Resmi hesap başvurusu reddedildi.");
        }
    }

    @Transactional
    public MessageResponse deleteUser(Long userId) {
        ensureAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        userRepository.delete(user);
        return new MessageResponse("Kullanıcı başarıyla silindi.");
    }

    @Transactional
    public MessageResponse deletePost(Long postId) {
        ensureAdmin();
        com.backend.elderconnect.entities.Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Error: Post not found."));
        postRepository.delete(post);
        return new MessageResponse("Post başarıyla silindi.");
    }

    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }

    private OfficialApplicationDTO mapProfileToApplicationDTO(OfficialProfile profile) {
        User user = profile.getUser();
        return OfficialApplicationDTO.builder()
                .userId(user.getId())
                .profileId(profile.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .surname(user.getSurname())
                .organizationName(profile.getOrganizationName())
                .organizationType(profile.getOrganizationType())
                .organizationDescription(profile.getOrganizationDescription())
                .appliedAt(profile.getAppliedAt())
                .build();
    }

    private AdminUserListDTO mapUserToListDTO(User user) {
        return AdminUserListDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .surname(user.getSurname())
                .city(user.getCity())
                .roles(user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()))
                .isApproved(user.isApproved())
                .joinedAt(user.getJoinedAt())
                .interests(user.getInterests())
                .build();
    }
}
