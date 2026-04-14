package com.backend.elderconnect.dto;

import com.backend.elderconnect.entities.VoteType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VoteRequest {
    @NotNull
    private VoteType type;
}
