package com.github.leloxo.socialmediaclone.dto.response;

import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private long expiresIn;
    private String username;
}
