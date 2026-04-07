package com.backend.elderconnect.controllers;

import com.backend.elderconnect.dto.*;
import com.backend.elderconnect.entities.Comment;
import com.backend.elderconnect.entities.Post;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.repositories.CommentRepository;
import com.backend.elderconnect.repositories.PostRepository;
import com.backend.elderconnect.repositories.UserRepository;
import com.backend.elderconnect.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PostRepository postRepository;

    @Autowired
    CommentRepository commentRepository;

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserProfile(username));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@Valid @RequestBody ProfileUpdateDTO updateDTO) {
        return ResponseEntity.ok(userService.updateMyProfile(updateDTO));
    }

    @GetMapping("/me/stats")
    public ResponseEntity<?> getMyStats() {
        return ResponseEntity.ok(userService.getMyStats());
    }

    @GetMapping("/me/saved")
    public ResponseEntity<?> getMySavedPosts() {
        return ResponseEntity.ok(userService.getMySavedPosts());
    }

    @PostMapping("/me/saved/{postId}")
    public ResponseEntity<?> savePost(@PathVariable Long postId) {
        userService.savePost(postId);
        return ResponseEntity.ok(new MessageResponse("Post saved successfully!"));
    }

    @DeleteMapping("/me/saved/{postId}")
    public ResponseEntity<?> removeSavedPost(@PathVariable Long postId) {
        userService.removeSavedPost(postId);
        return ResponseEntity.ok(new MessageResponse("Post removed from saved list!"));
    }

    @GetMapping("/{username}/activity")
    public ResponseEntity<?> getUserActivity(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        List<Post> posts = postRepository.findByAuthor(user);
        List<Comment> comments = commentRepository.findByCommenter(user);

        ActivityResponseDTO activity = ActivityResponseDTO.builder()
                .recentPosts(posts.stream().map(this::mapPostToDTO).collect(Collectors.toList()))
                .recentComments(comments.stream().map(this::mapCommentToDTO).collect(Collectors.toList()))
                .build();

        return ResponseEntity.ok(activity);
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
                .isOfficialAuthor(post.getAuthor().isConfirmed())
                .commentCount((long) post.getComments().size())
                .build();
    }

    private CommentResponseDTO mapCommentToDTO(Comment comment) {
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorUsername(comment.getCommenter().getUsername())
                .score(comment.getScore())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
