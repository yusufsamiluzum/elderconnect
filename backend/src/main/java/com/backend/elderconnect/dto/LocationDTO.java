package com.backend.elderconnect.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LocationDTO {
    private Long id;
    private String name;
    private String pictureUrl;
    private String addressLine1;
    private String city;
    private Double latitude;
    private Double longitude;
}
