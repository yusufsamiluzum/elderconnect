package com.backend.elderconnect.dto;

import lombok.Data;

@Data
public class ProfileUpdateDTO {
    private String name;
    private String surname;
    private String city;
    private String description;
}
