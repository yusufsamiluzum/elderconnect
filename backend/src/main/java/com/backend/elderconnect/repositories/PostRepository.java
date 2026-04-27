package com.backend.elderconnect.repositories;

import com.backend.elderconnect.entities.Post;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.entities.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("SELECT p FROM Post p WHERE (p.community IS NULL OR p.community IN :joinedCommunities) AND (p.eventDate IS NULL OR p.eventDate > CURRENT_TIMESTAMP)")
    Page<Post> findFeedPosts(List<Community> joinedCommunities, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.community IN :joinedCommunities AND (p.eventDate IS NULL OR p.eventDate > CURRENT_TIMESTAMP)")
    Page<Post> findFollowingPosts(List<Community> joinedCommunities, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.community IS NULL AND p.eventDate <= CURRENT_TIMESTAMP")
    Page<Post> findPastPostsByCommunityIsNull(Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.author.isApproved = true AND (p.eventDate IS NULL OR p.eventDate > CURRENT_TIMESTAMP)")
    Page<Post> findAllBulletins(Pageable pageable);

    Page<Post> findByCommunity(Community community, Pageable pageable);
    
    List<Post> findByAuthor(User author);
    
    @Query("SELECT p FROM Post p WHERE p.title LIKE %:query% OR p.content LIKE %:query%")
    List<Post> searchPosts(String query);

    @Query("SELECT p FROM Post p WHERE LOWER(p.keywords) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Post> findByKeyword(@Param("keyword") String keyword);
}
