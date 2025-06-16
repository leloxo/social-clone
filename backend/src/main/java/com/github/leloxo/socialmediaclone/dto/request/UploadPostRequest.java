package com.github.leloxo.socialmediaclone.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UploadPostRequest {
    @NotNull(message = "Image is required")
    private MultipartFile image;

    @NotBlank(message = "Caption cannot be empty")
    @Size(max = 1000, message = "Caption cannot be longer than 1000 characters")
    private String caption;
}
