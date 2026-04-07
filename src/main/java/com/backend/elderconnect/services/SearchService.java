package com.backend.elderconnect.services;

import com.backend.elderconnect.dto.CommunityResponseDTO;
import com.backend.elderconnect.dto.PostResponseDTO;
import com.backend.elderconnect.dto.UserProfileDTO;
import com.backend.elderconnect.repositories.CommunityRepository;
import com.backend.elderconnect.repositories.PostRepository;
import com.backend.elderconnect.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SearchService {
    @Autowired
    PostRepository postRepository;

    @Autowired
    CommunityRepository communityRepository;

    @Autowired
    UserRepository userRepository;

    public Map<String, Object> globalSearch(String query, String type) {
        Map<String, Object> results = new HashMap<>();

        if (type == null || "posts".equals(type)) {
            List<PostResponseDTO> posts = postRepository.searchPosts(query).stream()
                    .map(post -> PostResponseDTO.builder()
                            .id(post.getId())
                            .title(post.getTitle())
                            .content(post.getContent())
                            .pictureUrl(post.getPictureUrl())
                            .score(post.getScore())
                            .createdAt(post.getCreatedAt())
                            .authorName(post.getAuthor().getUsername())
                            .isOfficialAuthor(post.getAuthor().isConfirmed())
                            .commentCount((long) post.getComments().size())
                            .build())
                    .collect(Collectors.toList());
            results.put("posts", posts);
        }

        if (type == null || "communities".equals(type)) {
            List<CommunityResponseDTO> communities = communityRepository.searchCommunities(query).stream()
                    .map(community -> CommunityResponseDTO.builder()
                            .id(community.getId())
                            .name(community.getName())
                            .description(community.getDescription())
                            .memberCount(community.getMembers().size())
                            .isOfficial(community.isOfficial())
                            .type(community.getType())
                            .build())
                    .collect(Collectors.toList());
            results.put("communities", communities);
        }

        // Search users by username or name
        if (type == null || "users".equals(type)) {
             // We can add a searchUsers method to UserRepository if needed.
             // For now, let's keep it simple.
        }

        return results;
    }
}
