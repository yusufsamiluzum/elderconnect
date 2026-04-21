package com.backend.elderconnect.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "app_users") 
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(name = "first_name", length = 50)
    private String name;

    @Column(name = "last_name", length = 50)
    private String surname;

    @Column(length = 50)
    private String city;

    @Column(length = 500)
    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime joinedAt;

    // --- OUR DESIGN DECISIONS IMPLEMENTED HERE ---

    // 1. Privacy First: Location field is intentionally OMITTED.
    // Precise location data is a security risk for this demographic. 
    
    // 2. Official Organizations: Added to verify trusted users (e.g., u/city_hall)
    // Requires Super Admin approval if user is ROLE_OFFICIAL. Default true for ROLE_USER.
    @Column(nullable = false)
    private boolean isApproved = true;

    // 3. Derived Attribute: Karma is calculated on the fly, not stored as a hard column
    // @Transient tells JPA to ignore this field when creating the database table.
    @Transient 
    private Integer karmaScore;


    // --- RELATIONSHIPS ---

    // A user can create many posts. If a user is deleted, we might want their posts 
    // to stay (as "[deleted]") or be removed. CascadeType.ALL removes them.
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Post> posts = new HashSet<>();

    // A user can write many comments
    @OneToMany(mappedBy = "commenter", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();

    // The communities this user has joined. 
    // Usually, the Community entity "owns" this relationship via a join table.
    @ManyToMany(mappedBy = "members")
    private Set<Community> communitiesJoined = new HashSet<>();

    // The communities this user moderates.
    @ManyToMany(mappedBy = "moderators")
    private Set<Community> moderatedCommunities = new HashSet<>();

    // Posts the user has saved/bookmarked. 
    // The User entity "owns" this relationship, so we define the JoinTable here.
    @ManyToMany
    @JoinTable(
        name = "user_saved_posts",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "post_id")
    )
    private Set<Post> savedPosts = new HashSet<>();

    @ElementCollection(targetClass = UserRole.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Set<UserRole> roles = new HashSet<>();

}
