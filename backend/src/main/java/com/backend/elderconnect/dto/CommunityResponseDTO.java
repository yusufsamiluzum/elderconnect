package com.backend.elderconnect.dto;

import com.backend.elderconnect.entities.CommunityType;
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
    private boolean isOfficial;
    private CommunityType type;
    private String ownerName;
    private boolean isUserMember;
}
