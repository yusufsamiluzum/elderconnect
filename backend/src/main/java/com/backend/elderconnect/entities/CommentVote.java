package com.backend.elderconnect.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
// The uniqueConstraints block ensures a user can only have one active vote per comment.
// If they try to vote again, the database will block it, protecting your data integrity.
@Table(name = "comment_votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "comment_id"})
})
public class CommentVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user who is casting the vote.
    // FetchType.LAZY is used because we rarely need the full User profile just to tally votes.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The comment receiving the vote.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    // Reusing the VoteType Enum we created for PostVote (UPVOTE, DOWNVOTE)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoteType voteType;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;


    // --- CONSTRUCTORS, GETTERS, AND SETTERS ---

    public CommentVote() {
    }

    public CommentVote(User user, Comment comment, VoteType voteType) {
        this.user = user;
        this.comment = comment;
        this.voteType = voteType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Comment getComment() { return comment; }
    public void setComment(Comment comment) { this.comment = comment; }

    public VoteType getVoteType() { return voteType; }
    public void setVoteType(VoteType voteType) { this.voteType = voteType; }
}
