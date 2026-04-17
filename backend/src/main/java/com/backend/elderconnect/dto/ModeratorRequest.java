package com.backend.elderconnect.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModeratorRequest {
    @NotNull
    private Long userId;
}
