package com.backend.elderconnect.services;

import com.backend.elderconnect.dto.MessageResponse;
import com.backend.elderconnect.dto.UserProfileDTO;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.entities.UserRole;
import com.backend.elderconnect.repositories.PostRepository;
import com.backend.elderconnect.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PostRepository postRepository;

    private void ensureAdmin() {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        if (!user.getRoles().contains(UserRole.ROLE_ADMIN)) {
            throw new RuntimeException("Error: Unauthorized. Super Admin access required.");
        }
    }

    public List<UserProfileDTO> getPendingOfficials() {
        ensureAdmin();
        // Return users who have ROLE_OFFICIAL and isApproved = false
        List<User> pendingUsers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(UserRole.ROLE_OFFICIAL) && !u.isApproved())
                .collect(Collectors.toList());

        return pendingUsers.stream()
                .map(this::mapUserToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse approveOfficial(Long userId, boolean approve) {
        ensureAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!user.getRoles().contains(UserRole.ROLE_OFFICIAL)) {
            throw new RuntimeException("Error: User is not an official account.");
        }

        if (approve) {
            user.setApproved(true);
            userRepository.save(user);
            return new MessageResponse("Official account approved successfully.");
        } else {
            userRepository.delete(user);
            return new MessageResponse("Official account rejected and deleted.");
        }
    }

    @Transactional
    public MessageResponse deleteUser(Long userId) {
        ensureAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        userRepository.delete(user);
        return new MessageResponse("User deleted successfully.");
    }

    @Transactional
    public MessageResponse deletePost(Long postId) {
        ensureAdmin();
        com.backend.elderconnect.entities.Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Error: Post not found."));
        postRepository.delete(post);
        return new MessageResponse("Post deleted successfully.");
    }

    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
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
