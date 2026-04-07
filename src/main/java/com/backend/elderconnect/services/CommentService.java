package com.backend.elderconnect.services;

import com.backend.elderconnect.dto.CommentResponseDTO;
import com.backend.elderconnect.entities.*;
import com.backend.elderconnect.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentService {
    @Autowired
    CommentRepository commentRepository;

    @Autowired
    PostRepository postRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    CommentVoteRepository commentVoteRepository;

    public List<CommentResponseDTO> getCommentsForPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Error: Post not found."));

        List<Comment> topLevelComments = commentRepository.findByPostAndParentCommentIsNull(post);

        return topLevelComments.stream()
                .map(this::mapCommentToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponseDTO createComment(Long postId, String content) {
        String username = getCurrentUsername();
        User author = userRepository.findByUsername(username).get();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Error: Post not found."));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setCommenter(author);
        comment.setPost(post);
        comment.setScore(0);

        comment = commentRepository.save(comment);
        return mapCommentToDTO(comment);
    }

    @Transactional
    public CommentResponseDTO replyToComment(Long commentId, String content) {
        String username = getCurrentUsername();
        User author = userRepository.findByUsername(username).get();
        Comment parentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Error: Comment not found."));

        Comment reply = new Comment();
        reply.setContent(content);
        reply.setCommenter(author);
        reply.setPost(parentComment.getPost());
        reply.setParentComment(parentComment);
        reply.setScore(0);

        reply = commentRepository.save(reply);
        return mapCommentToDTO(reply);
    }

    @Transactional
    public CommentResponseDTO updateComment(Long id, String content) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Comment not found."));

        if (!comment.getCommenter().getUsername().equals(getCurrentUsername())) {
            throw new RuntimeException("Error: Unauthorized.");
        }

        comment.setContent(content);
        comment = commentRepository.save(comment);
        return mapCommentToDTO(comment);
    }

    @Transactional
    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Comment not found."));

        if (!comment.getCommenter().getUsername().equals(getCurrentUsername())) {
             throw new RuntimeException("Error: Unauthorized.");
        }

        commentRepository.delete(comment);
    }

    @Transactional
    public void voteComment(Long id, VoteType type) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username).get();
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Comment not found."));

        Optional<CommentVote> existingVote = commentVoteRepository.findByCommentAndUser(comment, user);

        if (existingVote.isPresent()) {
            CommentVote vote = existingVote.get();
            if (vote.getType() == type) {
                comment.setScore(comment.getScore() - vote.getType().getValue());
                commentVoteRepository.delete(vote);
            } else {
                comment.setScore(comment.getScore() - vote.getType().getValue() + type.getValue());
                vote.setType(type);
                commentVoteRepository.save(vote);
            }
        } else {
            CommentVote vote = new CommentVote();
            vote.setComment(comment);
            vote.setUser(user);
            vote.setType(type);
            comment.setScore(comment.getScore() + type.getValue());
            commentVoteRepository.save(vote);
        }
        commentRepository.save(comment);
    }

    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }

    private CommentResponseDTO mapCommentToDTO(Comment comment) {
        String currentUsername = null;
        try {
            currentUsername = getCurrentUsername();
        } catch (Exception e) {}

        String userVote = null;
        if (currentUsername != null) {
            User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
            if (currentUser != null) {
                Optional<CommentVote> vote = commentVoteRepository.findByCommentAndUser(comment, currentUser);
                if (vote.isPresent()) {
                    userVote = vote.get().getType().name();
                }
            }
        }

        List<CommentResponseDTO> replies = comment.getReplies().stream()
                .map(this::mapCommentToDTO)
                .collect(Collectors.toList());

        return CommentResponseDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorUsername(comment.getCommenter().getUsername())
                .score(comment.getScore())
                .createdAt(comment.getCreatedAt())
                .replies(replies)
                .userVote(userVote)
                .build();
    }
}
