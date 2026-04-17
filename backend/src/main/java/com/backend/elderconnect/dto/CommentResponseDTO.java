package com.backend.elderconnect.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponseDTO {
    private Long id;
    private String content;
    private String authorUsername;
    private Integer score;
    private LocalDateTime createdAt;
    private List<CommentResponseDTO> replies;
    private String userVote; // UPVOTE, DOWNVOTE, or null
}
