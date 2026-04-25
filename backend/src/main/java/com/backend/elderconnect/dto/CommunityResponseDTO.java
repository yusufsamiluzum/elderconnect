package com.backend.elderconnect.dto;

import com.backend.elderconnect.entities.CommunityType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommunityResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Integer memberCount;
    private CommunityType type;
    private String ownerName;
    @JsonProperty("isUserMember")
    private boolean isUserMember;
    @JsonProperty("isUserModerator")
    private boolean isUserModerator;
}
