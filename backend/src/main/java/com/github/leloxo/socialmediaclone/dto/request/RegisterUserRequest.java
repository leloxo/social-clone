package com.github.leloxo.socialmediaclone.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterUserRequest {
    @NotEmpty(message = "First name is required.")
    @Size(max = 50, message = "The length of first name must be less or equal than 50 characters.")
    private String firstName;

    @NotEmpty(message = "Last name is required.")
    @Size(max = 50, message = "The length of last name must be less or equal than 50 characters.")
    private String lastName;

    @NotEmpty(message = "Username is required.")
    @Size(max = 20, message = "The length of user name must be less or equal than 20 characters.")
    private String userName;

    @NotEmpty(message = "Email address is required.")
    @Email(message = "The email address is invalid.", flags = {Pattern.Flag.CASE_INSENSITIVE})
    private String email;

    @NotEmpty(message = "Password is required.")
    @Size(min = 8, message = "Password must be at least 8 characters long.")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
            message = "Password must contain one uppercase, one lowercase, and one number."
    )
    private String password;
}
