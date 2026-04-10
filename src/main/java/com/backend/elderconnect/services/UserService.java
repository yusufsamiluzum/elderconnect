package com.backend.elderconnect.services;

import com.backend.elderconnect.dto.PostResponseDTO;
import com.backend.elderconnect.dto.ProfileUpdateDTO;
import com.backend.elderconnect.dto.UserProfileDTO;
import com.backend.elderconnect.dto.UserStatsDTO;
import com.backend.elderconnect.entities.Comment;
import com.backend.elderconnect.entities.Post;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.repositories.CommentRepository;
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
public class UserService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PostRepository postRepository;

    @Autowired
    CommentRepository commentRepository;

    public UserProfileDTO getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        return UserProfileDTO.builder()
                .username(user.getUsername())
                .name(user.getName())
                .surname(user.getSurname())
                .description(user.getDescription())
                .joinedAt(user.getJoinedAt())
                .isApproved(user.isApproved())
                .karmaScore(calculateKarma(user))
                .build();
    }

    @Transactional
    public UserProfileDTO updateMyProfile(ProfileUpdateDTO updateDTO) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username).get();

        if (updateDTO.getName() != null) user.setName(updateDTO.getName());
        if (updateDTO.getSurname() != null) user.setSurname(updateDTO.getSurname());
        if (updateDTO.getDescription() != null) user.setDescription(updateDTO.getDescription());

        user = userRepository.save(user);
        return getUserProfile(user.getUsername());
    }

    public UserStatsDTO getMyStats() {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username).get();

        List<Post> posts = postRepository.findByAuthor(user);
        List<Comment> comments = commentRepository.findByCommenter(user);

        return UserStatsDTO.builder()
                .totalPosts((long) posts.size())
                .totalComments((long) comments.size())
                .karmaScore(calculateKarma(user))
                .build();
    }

    public java.util.Map<String, Object> getOfficialStats() {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username).get();

        List<Post> posts = postRepository.findByAuthor(user);
        long totalPosts = posts.size();
        long totalInteractions = posts.stream().mapToLong(p -> p.getComments().size() + Math.abs(p.getScore())).sum();
        double avgScore = posts.stream().mapToInt(Post::getScore).average().orElse(0.0);

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalPosts", totalPosts);
        stats.put("totalInteractions", totalInteractions);
        stats.put("averageScorePerPost", avgScore);
        return stats;
    }

    public List<PostResponseDTO> getMySavedPosts() {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username).get();

        return user.getSavedPosts().stream()
                .map(this::mapPostToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void savePost(Long postId) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username).get();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Error: Post not found."));

        user.getSavedPosts().add(post);
        userRepository.save(user);
    }

    @Transactional
    public void removeSavedPost(Long postId) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username).get();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Error: Post not found."));

        user.getSavedPosts().remove(post);
        userRepository.save(user);
    }

    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }

    private Integer calculateKarma(User user) {
        // Simple aggregate score of all posts and comments
        int postKarma = postRepository.findByAuthor(user).stream()
                .mapToInt(Post::getScore)
                .sum();
        int commentKarma = commentRepository.findByCommenter(user).stream()
                .mapToInt(Comment::getScore)
                .sum();
        return postKarma + commentKarma;
    }

    private PostResponseDTO mapPostToDTO(Post post) {
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
}
