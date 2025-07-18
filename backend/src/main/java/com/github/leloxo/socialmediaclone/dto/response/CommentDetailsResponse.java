package com.github.leloxo.socialmediaclone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentDetailsResponse {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private UserSummaryResponse authorSummary;
}
