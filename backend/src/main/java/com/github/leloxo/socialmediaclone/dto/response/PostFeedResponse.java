package com.github.leloxo.socialmediaclone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostFeedResponse {
    private Long id;
    private String imageUrl;
    private String caption;
    private LocalDateTime createdAt;
    private UserSummaryResponse authorSummary;
    private int commentCount;
    private int likeCount;
}
