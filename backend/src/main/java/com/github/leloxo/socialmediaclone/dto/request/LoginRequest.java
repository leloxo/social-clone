package com.github.leloxo.socialmediaclone.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LoginRequest {
    @NotEmpty(message = "Email address is required.")
    @Email(message = "The email address is invalid.", flags = { Pattern.Flag.CASE_INSENSITIVE })
    private String email;

    // TODO: remove pwd validation here?
    @NotEmpty(message = "Password is required.")
//    @Size(min = 8, message = "Password must be at least 8 characters long.")
//    @Pattern(
//            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
//            message = "Password must contain one uppercase, one lowercase, and one number."
//    )
    private String password;
}
