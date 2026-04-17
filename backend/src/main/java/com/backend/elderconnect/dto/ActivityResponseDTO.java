package com.backend.elderconnect.dto;

import java.util.List;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityResponseDTO {
    private List<PostResponseDTO> recentPosts;
    private List<CommentResponseDTO> recentComments;
}
