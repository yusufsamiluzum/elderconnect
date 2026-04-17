package com.backend.elderconnect.controllers;

import com.backend.elderconnect.dto.CommentRequest;
import com.backend.elderconnect.dto.MessageResponse;
import com.backend.elderconnect.dto.VoteRequest;
import com.backend.elderconnect.services.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class CommentController {
    @Autowired
    CommentService commentService;

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> getCommentsForPost(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsForPost(postId));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> createComment(@PathVariable Long postId, @Valid @RequestBody CommentRequest commentRequest) {
        return ResponseEntity.ok(commentService.createComment(postId, commentRequest.getContent()));
    }

    @PostMapping("/comments/{commentId}/replies")
    public ResponseEntity<?> replyToComment(@PathVariable Long commentId, @Valid @RequestBody CommentRequest commentRequest) {
        return ResponseEntity.ok(commentService.replyToComment(commentId, commentRequest.getContent()));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @Valid @RequestBody CommentRequest commentRequest) {
        return ResponseEntity.ok(commentService.updateComment(id, commentRequest.getContent()));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok(new MessageResponse("Comment deleted successfully!"));
    }

    @PostMapping("/comments/{id}/vote")
    public ResponseEntity<?> voteComment(@PathVariable Long id, @Valid @RequestBody VoteRequest voteRequest) {
        commentService.voteComment(id, voteRequest.getType());
        return ResponseEntity.ok(new MessageResponse("Vote recorded successfully!"));
    }
}
