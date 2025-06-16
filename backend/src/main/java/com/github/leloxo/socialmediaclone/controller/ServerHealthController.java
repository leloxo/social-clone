package com.github.leloxo.socialmediaclone.controller;

import com.github.leloxo.socialmediaclone.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class ServerHealthController {
    @GetMapping
    public ResponseEntity<ApiResponse> getServerHealthStatus() {
        return ResponseEntity.ok(new ApiResponse(true, "Server is running"));
    }
}
