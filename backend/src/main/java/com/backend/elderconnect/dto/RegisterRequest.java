package com.backend.elderconnect.dto;

import java.util.Set;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @Size(max = 50)
    private String name;

    @Size(max = 50)
    private String surname;

    @Size(max = 50)
    private String city;

    private Set<String> role;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
}
