package com.backend.elderconnect.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserStatsDTO {
    private Long totalPosts;
    private Long totalComments;
    private Integer karmaScore;
}
