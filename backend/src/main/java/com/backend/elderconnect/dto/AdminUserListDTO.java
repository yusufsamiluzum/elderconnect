package com.backend.elderconnect.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.Set;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserListDTO {
    private Long id;
    private String username;
    private String email;
    private String name;
    private String surname;
    private String city;
    private Set<String> roles;
    @JsonProperty("isApproved")
    private boolean isApproved;
    private LocalDateTime joinedAt;
    private String interests;
}
