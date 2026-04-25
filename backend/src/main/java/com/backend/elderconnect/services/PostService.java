package com.backend.elderconnect.services;

import com.backend.elderconnect.dto.PostResponseDTO;
import com.backend.elderconnect.entities.*;
import com.backend.elderconnect.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {
    @Autowired
    PostRepository postRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PostVoteRepository postVoteRepository;

    @Autowired
    CommunityRepository communityRepository;

    public Page<PostResponseDTO> getAllPosts(String sortType, String filter, int page, int size) {
        Pageable pageable;
        switch (sortType) {
            case "top":
                pageable = PageRequest.of(page, size, Sort.by("score").descending());
                break;
            case "hot":
                pageable = PageRequest.of(page, size, Sort.by("score").descending().and(Sort.by("createdAt").descending()));
                break;
            case "new":
            default:
                pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                break;
        }

        String username = null;
        try { username = getCurrentUsername(); } catch (Exception e) {}
        
        List<Community> joinedCommunities = java.util.Collections.emptyList();
        if (username != null && !"anonymousUser".equals(username)) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                joinedCommunities = new java.util.ArrayList<>(user.getCommunitiesJoined());
            }
        }

        if ("following".equals(filter)) {
            return postRepository.findFollowingPosts(joinedCommunities, pageable).map(this::mapPostToDTO);
        } else {
            return postRepository.findFeedPosts(joinedCommunities, pageable).map(this::mapPostToDTO);
        }
    }

    public Page<PostResponseDTO> getPastPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("eventDate").descending());
        return postRepository.findPastPostsByCommunityIsNull(pageable).map(this::mapPostToDTO);
    }

    public Page<PostResponseDTO> getBulletins(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findAllBulletins(pageable).map(this::mapPostToDTO);
    }

    @Transactional
    public PostResponseDTO createPost(String title, String content, String pictureUrl, Long communityId, java.time.LocalDateTime eventDate, Long locationId) {
        String username = getCurrentUsername();
        User author = userRepository.findByUsername(username).get();

        Community community = null;
        if (communityId != null) {
            community = communityRepository.findById(communityId)
                    .orElseThrow(() -> new RuntimeException("Error: Community not found."));

            // Topluluk üyeliği kontrolü
            if (!community.getMembers().contains(author)) {
                throw new RuntimeException("Error: You must join this community before sharing a post.");
            }
        }

        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setPictureUrl(pictureUrl);
        post.setAuthor(author);
        post.setEventDate(eventDate);
        post.setScore(0);

        if (communityId != null) {
            post.setCommunity(community);
        }

        post = postRepository.save(post);
        return mapPostToDTO(post);
    }

    public PostResponseDTO getPostDetail(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Post not found."));
        return mapPostToDTO(post);
    }

    @Transactional
    public PostResponseDTO updatePost(Long id, String title, String content) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Post not found."));

        if (!post.getAuthor().getUsername().equals(getCurrentUsername())) {
            throw new RuntimeException("Error: You are not the author of this post.");
        }

        if (title != null) post.setTitle(title);
        if (content != null) post.setContent(content);

        post = postRepository.save(post);
        return mapPostToDTO(post);
    }

    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Post not found."));

        if (!post.getAuthor().getUsername().equals(getCurrentUsername())) {
            throw new RuntimeException("Error: You are not author / moderator.");
        }

        postRepository.delete(post);
    }

    @Transactional
    public void votePost(Long id, VoteType type) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username).get();
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Post not found."));

        Optional<PostVote> existingVote = postVoteRepository.findByPostAndUser(post, user);

        if (existingVote.isPresent()) {
            PostVote vote = existingVote.get();
            if (vote.getVoteType() == type) {
                // If clicking same vote icon again, it removes the vote
                post.setScore(post.getScore() - vote.getVoteType().getValue());
                postVoteRepository.delete(vote);
            } else {
                // Changing from UP to DOWN or vice versa
                post.setScore(post.getScore() - vote.getVoteType().getValue() + type.getValue());
                vote.setVoteType(type);
                postVoteRepository.save(vote);
            }
        } else {
            // New vote
            PostVote vote = new PostVote();
            vote.setPost(post);
            vote.setUser(user);
            vote.setVoteType(type);
            post.setScore(post.getScore() + type.getValue());
            postVoteRepository.save(vote);
        }
        postRepository.save(post);
    }

    @Transactional
    public void forwardPost(Long id, Long communityId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Post not found."));
        Community targetCommunity = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));

        // Creating a "forwarded" copy or reference. 
        // For simplicity, let's just create a new post with reference to original.
        Post forwardedPost = new Post();
        forwardedPost.setTitle("[FWD] " + post.getTitle());
        forwardedPost.setContent(post.getContent());
        forwardedPost.setPictureUrl(post.getPictureUrl());
        forwardedPost.setAuthor(post.getAuthor()); // Or current user? Usually current user forwards it.
        
        String username = getCurrentUsername();
        User forwarder = userRepository.findByUsername(username).get();
        if (!targetCommunity.getModerators().contains(forwarder)) {
            throw new RuntimeException("Error: Only community admins can forward posts here.");
        }

        forwardedPost.setAuthor(forwarder); 
        
        forwardedPost.setCommunity(targetCommunity);
        forwardedPost.setOriginalPost(post);
        postRepository.save(forwardedPost);
    }

    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }

    private PostResponseDTO mapPostToDTO(Post post) {
        String currentUsername = null;
        try {
            currentUsername = getCurrentUsername();
        } catch (Exception e) {}

        String userVote = null;
        if (currentUsername != null) {
            User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
            if (currentUser != null) {
                Optional<PostVote> vote = postVoteRepository.findByPostAndUser(post, currentUser);
                if (vote.isPresent()) {
                    userVote = vote.get().getVoteType().name();
                }
            }
        }

        return PostResponseDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .pictureUrl(post.getPictureUrl())
                .score(post.getScore())
                .createdAt(post.getCreatedAt())
                .authorName(post.getAuthor() != null ? post.getAuthor().getUsername() : "Bilinmeyen")
                .isOfficialAuthor(post.getAuthor() != null && post.getAuthor().getRoles().contains(UserRole.ROLE_OFFICIAL))
                .commentCount((long) (post.getComments() != null ? post.getComments().size() : 0))
                .userVote(userVote)
                .originalPostId(post.getOriginalPost() != null ? post.getOriginalPost().getId() : null)
                .communityId(post.getCommunity() != null ? post.getCommunity().getId() : null)
                .communityName(post.getCommunity() != null ? post.getCommunity().getName() : null)
                .build();
    }
}
