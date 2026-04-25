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
public class OfficialApplicationDTO {
    private Long userId;
    private Long profileId;
    private String username;
    private String email;
    private String name;
    private String surname;
    private String organizationName;
    private String organizationType;
    private String organizationDescription;
    private LocalDateTime appliedAt;
}
