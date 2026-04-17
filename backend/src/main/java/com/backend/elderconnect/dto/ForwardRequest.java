package com.backend.elderconnect.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ForwardRequest {
    @NotNull
    private Long communityId;
}
