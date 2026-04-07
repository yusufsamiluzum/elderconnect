package com.backend.elderconnect.controllers;

import com.backend.elderconnect.dto.*;
import com.backend.elderconnect.services.CommunityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/communities")
public class CommunityController {
    @Autowired
    CommunityService communityService;

    @GetMapping
    public ResponseEntity<?> getAllCommunities(@RequestParam(required = false) String filter) {
        return ResponseEntity.ok(communityService.getAllCommunities(filter));
    }

    @PostMapping
    public ResponseEntity<?> createCommunity(@Valid @RequestBody CommunityRequest communityRequest) {
        return ResponseEntity.ok(communityService.createCommunity(
                communityRequest.getName(),
                communityRequest.getDescription(),
                communityRequest.getType()
        ));
    }

    @GetMapping("/{name}")
    public ResponseEntity<?> getCommunityDetail(@PathVariable String name) {
        return ResponseEntity.ok(communityService.getCommunityDetail(name));
    }

    @PostMapping("/{id}/membership")
    public ResponseEntity<?> joinCommunity(@PathVariable Long id) {
        communityService.joinOrLeaveCommunity(id);
        return ResponseEntity.ok(new MessageResponse("Membership updated successfully!"));
    }

    @DeleteMapping("/{id}/membership")
    public ResponseEntity<?> leaveCommunity(@PathVariable Long id) {
        communityService.joinOrLeaveCommunity(id);
        return ResponseEntity.ok(new MessageResponse("Membership updated successfully!"));
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<?> getCommunityPosts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(communityService.getCommunityPosts(id, page, size));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<?> getCommunityMembers(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(communityService.getCommunityMembers(id, page, size));
    }

    @PostMapping("/{id}/moderators")
    public ResponseEntity<?> addModerator(@PathVariable Long id, @Valid @RequestBody ModeratorRequest moderatorRequest) {
        communityService.addOrRemoveModerator(id, moderatorRequest.getUserId(), true);
        return ResponseEntity.ok(new MessageResponse("Moderator added successfully!"));
    }

    @DeleteMapping("/{id}/moderators")
    public ResponseEntity<?> removeModerator(@PathVariable Long id, @Valid @RequestBody ModeratorRequest moderatorRequest) {
        communityService.addOrRemoveModerator(id, moderatorRequest.getUserId(), false);
        return ResponseEntity.ok(new MessageResponse("Moderator removed successfully!"));
    }
}
