package com.backend.elderconnect.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "official_profiles")
public class OfficialProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String organizationName;

    @Column(length = 50)
    private String organizationType;

    @Column(length = 500)
    private String organizationDescription;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime appliedAt;

    @Column
    private LocalDateTime approvedAt;

    @Column(length = 300)
    private String rejectionReason;
}
