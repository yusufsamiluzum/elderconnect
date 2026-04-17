package com.backend.elderconnect.dto;

import com.backend.elderconnect.entities.CommunityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommunityRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    private String description;
    
    @NotNull
    private CommunityType type;
}
