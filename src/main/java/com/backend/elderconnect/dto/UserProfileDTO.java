package com.backend.elderconnect.dto;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDTO {
    private String username;
    private String name;
    private String surname;
    private String description;
    private LocalDateTime joinedAt;
    private boolean isConfirmed;
    private Integer karmaScore;
}
