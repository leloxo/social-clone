package com.github.leloxo.socialmediaclone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostDetailsResponse {
    private Long id;
    private String imageUrl;
    private String caption;
    private LocalDateTime createdAt;
    private UserSummaryResponse authorSummary;
    private List<CommentDetailsResponse> comments;
    private int likeCount;
    private int commentCount;
}
