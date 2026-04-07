package com.backend.elderconnect.repositories;

import com.backend.elderconnect.entities.Post;
import com.backend.elderconnect.entities.PostVote;
import com.backend.elderconnect.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostVoteRepository extends JpaRepository<PostVote, Long> {
    Optional<PostVote> findByPostAndUser(Post post, User user);
}
