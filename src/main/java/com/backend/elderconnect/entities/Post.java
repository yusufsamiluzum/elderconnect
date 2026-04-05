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
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    // Using columnDefinition = "TEXT" allows for longer post content 
    // without hitting the standard 255 character limit of a basic String.
    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "picture_url")
    private String pictureUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // To support the "Hot" and "Top" sorting tabs efficiently, it is best practice 
    // to store the aggregate score directly on the post rather than calculating it 
    // from scratch every time the feed loads.
    @Column(nullable = false)
    private Integer score = 0;


    // --- RELATIONSHIPS ---

    // Every post MUST have an author. FetchType.LAZY is good practice here 
    // so we don't load the entire User object unless we specifically ask for it.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    // A post CAN belong to a community, but it's OPTIONAL. 
    // nullable = true allows users to post directly to their own profile.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = true)
    private Community community;

    // A post can have many comments. 
    // If a post is deleted, we want to delete all of its comments too (CascadeType.ALL).
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();

    // Users who have saved this post. This is the inverse side of the ManyToMany 
    // relationship we defined in the User entity.
    @ManyToMany(mappedBy = "savedPosts")
    private Set<User> savedByUsers = new HashSet<>();

}
