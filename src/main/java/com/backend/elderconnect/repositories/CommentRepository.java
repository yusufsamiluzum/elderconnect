package com.backend.elderconnect.repositories;

import com.backend.elderconnect.entities.Comment;
import com.backend.elderconnect.entities.Post;
import com.backend.elderconnect.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostAndParentCommentIsNull(Post post);
    List<Comment> findByCommenter(User commenter);
}
