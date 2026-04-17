package com.backend.elderconnect.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank
    private String email;
    
    private String token;
    private String newPassword;
}
