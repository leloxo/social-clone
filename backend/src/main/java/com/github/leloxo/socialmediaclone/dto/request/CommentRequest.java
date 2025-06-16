package com.github.leloxo.socialmediaclone.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentRequest {
    @NotBlank(message = "Comment cannot be empty")
    @Size(max = 500, message = "Comment cannot be longer than 500 characters")
    private String content;
}
