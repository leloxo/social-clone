package com.github.leloxo.socialmediaclone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FollowerCountResponse {
    private Long userId;
    private long followerCount;
}
