package com.backend.elderconnect.dto;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private String locationName;
    private String address;
    private String organizerName;
    private String pictureUrl;
    private int participantCount;
}
