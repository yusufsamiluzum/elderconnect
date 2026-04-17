package com.backend.elderconnect.repositories;

import com.backend.elderconnect.entities.Comment;
import com.backend.elderconnect.entities.CommentVote;
import com.backend.elderconnect.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentVoteRepository extends JpaRepository<CommentVote, Long> {
    Optional<CommentVote> findByCommentAndUser(Comment comment, User user);
}
