package com.backend.elderconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterResponse {
    private String status;   // "ACTIVE" | "PENDING_APPROVAL"
    private String message;
}
