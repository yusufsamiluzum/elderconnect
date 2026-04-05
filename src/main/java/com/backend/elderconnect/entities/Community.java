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
@Table(name = "communities")
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The unique identifier used in the URL (e.g., 'local-events' for c/local-events)
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 1000)
    private String description;

    // Maps the Public/Private radio buttons from your 'Create a Community' UI
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommunityType type = CommunityType.PUBLIC;

    // The official green tag seen in your mockups
    @Column(nullable = false)
    private boolean isOfficial = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;


    // --- RELATIONSHIPS ---

    // The Community entity "owns" the members relationship, so we define the join table here.
    @ManyToMany
    @JoinTable(
        name = "community_members",
        joinColumns = @JoinColumn(name = "community_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    // We need a separate join table specifically for moderators.
    @ManyToMany
    @JoinTable(
        name = "community_moderators",
        joinColumns = @JoinColumn(name = "community_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> moderators = new HashSet<>();

    // One community can have many posts. 
    // The "community" field in the Post entity maps this.
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL)
    private Set<Post> posts = new HashSet<>();

    // One community can have many locations (e.g., meeting spots, event venues).
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Location> locations = new HashSet<>();

}
