package com.backend.elderconnect.controllers;

import com.backend.elderconnect.dto.*;
import com.backend.elderconnect.services.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/posts")
public class PostController {
    @Autowired
    PostService postService;

    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "new") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getAllPosts(sort, page, size));
    }

    @GetMapping("/past-events")
    public ResponseEntity<?> getPastPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getPastPosts(page, size));
    }

    @GetMapping("/bulletin")
    public ResponseEntity<?> getBulletins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getBulletins(page, size));
    }

    @PostMapping
    public ResponseEntity<?> createPost(@Valid @RequestBody PostRequest postRequest) {
        return ResponseEntity.ok(postService.createPost(
                postRequest.getTitle(),
                postRequest.getContent(),
                postRequest.getPictureUrl(),
                postRequest.getCommunityId(),
                postRequest.getEventDate(),
                postRequest.getLocationId()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostDetail(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostDetail(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @Valid @RequestBody PostRequest postRequest) {
        return ResponseEntity.ok(postService.updatePost(id, postRequest.getTitle(), postRequest.getContent()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok(new MessageResponse("Post deleted successfully!"));
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> votePost(@PathVariable Long id, @Valid @RequestBody VoteRequest voteRequest) {
        postService.votePost(id, voteRequest.getType());
        return ResponseEntity.ok(new MessageResponse("Vote recorded successfully!"));
    }

    @PostMapping("/{id}/forward")
    public ResponseEntity<?> forwardPost(@PathVariable Long id, @Valid @RequestBody ForwardRequest forwardRequest) {
        postService.forwardPost(id, forwardRequest.getCommunityId());
        return ResponseEntity.ok(new MessageResponse("Post forwarded successfully!"));
    }
}
