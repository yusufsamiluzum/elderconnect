package com.backend.elderconnect.dto;

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

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    // "user" veya "official" — admin register yolu yok
    @NotBlank
    private String accountType;

    // Official hesap için zorunlu alanlar
    private String organizationName;
    private String organizationType;
    private String organizationDescription;
}
