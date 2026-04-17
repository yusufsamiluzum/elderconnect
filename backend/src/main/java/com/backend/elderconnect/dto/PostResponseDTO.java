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
public class PostResponseDTO {
    private Long id;
    private String title;
    private String content;
    private String pictureUrl;
    private Integer score;
    private LocalDateTime createdAt;
    private String authorName;
    private boolean isOfficialAuthor;
    private Long commentCount;
    private String userVote; // UPVOTE, DOWNVOTE, or null
    private Long originalPostId;
}
