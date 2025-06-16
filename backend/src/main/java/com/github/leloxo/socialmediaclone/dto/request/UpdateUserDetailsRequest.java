package com.github.leloxo.socialmediaclone.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserDetailsRequest {
    private String profileImageUrl;

    @Size(max = 200, message = "Biography can't be longer than 200 characters.")
    private String biography;
}
