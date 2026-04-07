package com.backend.elderconnect.repositories;

import com.backend.elderconnect.entities.Post;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.entities.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findAllByCommunityIsNull(Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.author.isConfirmed = true")
    Page<Post> findAllBulletins(Pageable pageable);
    
    Page<Post> findByCommunity(Community community, Pageable pageable);
    
    List<Post> findByAuthor(User author);
    
    @Query("SELECT p FROM Post p WHERE p.title LIKE %:query% OR p.content LIKE %:query%")
    List<Post> searchPosts(String query);
}
