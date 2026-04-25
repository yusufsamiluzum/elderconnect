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

    @GetMapping("/{identifier}")
    public ResponseEntity<?> getCommunity(@PathVariable String identifier) {
        try {
            Long id = Long.parseLong(identifier);
            return ResponseEntity.ok(communityService.getCommunityById(id));
        } catch (NumberFormatException e) {
            return ResponseEntity.ok(communityService.getCommunityDetail(identifier));
        }
    }

    @PostMapping("/{id}/requests")
    public ResponseEntity<?> joinCommunity(@PathVariable Long id) {
        String message = communityService.joinCommunity(id);
        return ResponseEntity.ok(new MessageResponse(message));
    }

    @GetMapping("/{id}/requests")
    public ResponseEntity<?> getPendingRequests(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.getPendingRequests(id));
    }

    @PutMapping("/{id}/requests/{requestId}")
    public ResponseEntity<?> handleJoinRequest(@PathVariable Long id, @PathVariable Long requestId, @RequestParam boolean approved) {
        communityService.handleJoinRequest(id, requestId, approved);
        return ResponseEntity.ok(new MessageResponse("Join request handled successfully!"));
    }

    @DeleteMapping("/{id}/membership")
    public ResponseEntity<?> leaveCommunity(@PathVariable Long id) {
        communityService.leaveCommunity(id);
        return ResponseEntity.ok(new MessageResponse("Membership removed successfully!"));
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
