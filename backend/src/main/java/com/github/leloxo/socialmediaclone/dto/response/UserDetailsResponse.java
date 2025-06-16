package com.github.leloxo.socialmediaclone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDetailsResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String userName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String profileImageUrl;
    private String biography;
}
