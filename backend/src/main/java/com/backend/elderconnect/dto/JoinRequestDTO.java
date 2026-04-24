package com.backend.elderconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JoinRequestDTO {
    private Long requestId;
    private Long userId;
    private String username;
    private String name;
    private String surname;
}
