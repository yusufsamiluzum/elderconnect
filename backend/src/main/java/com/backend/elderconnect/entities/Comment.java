package com.backend.elderconnect.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // columnDefinition = "TEXT" allows for long-form comments
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Denormalized score for fast sorting of top comments, 
    // just like we decided to keep for Posts.
    @Column(nullable = false)
    private Integer score = 0;


    // --- RELATIONSHIPS ---

    // The user who wrote the comment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commenter_id", nullable = false)
    private User commenter;

    // The post this comment belongs to. 
    // ALL comments (even deep replies) should link back to the main post 
    // so you can easily fetch all comments for a specific post in one query.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    // --- THE REPLY SYSTEM (Self-Referencing) ---

    // If this is a top-level comment, parentComment will be NULL.
    // If this is a reply, parentComment will point to the comment being replied to.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id", nullable = true)
    private Comment parentComment;

    // A list of all replies made DIRECTLY to this comment.
    // CascadeType.ALL ensures if a parent comment is deleted, its replies are too.
    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> replies = new HashSet<>();

}
