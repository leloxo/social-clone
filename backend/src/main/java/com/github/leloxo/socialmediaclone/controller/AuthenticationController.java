package com.github.leloxo.socialmediaclone.controller;

import com.github.leloxo.socialmediaclone.dto.request.LoginRequest;
import com.github.leloxo.socialmediaclone.dto.request.RegisterUserRequest;
import com.github.leloxo.socialmediaclone.dto.response.ApiResponse;
import com.github.leloxo.socialmediaclone.dto.response.AuthenticationResponse;
import com.github.leloxo.socialmediaclone.dto.response.LoginResponse;
import com.github.leloxo.socialmediaclone.model.User;
import com.github.leloxo.socialmediaclone.service.AuthenticationService;
import com.github.leloxo.socialmediaclone.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    // TODO: Use RegisterResponse class
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> register(
            @Valid @RequestBody RegisterUserRequest registerUserRequest
    ) {
        User registeredUser = authenticationService.signup(registerUserRequest);

        logger.info("{} registered successfully", registeredUser.getDisplayUsername());

        return ResponseEntity.ok(new ApiResponse(true, "Successfully registered"));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(
            @Valid @RequestBody LoginRequest loginRequest
    ) {
        User authenticatedUser = authenticationService.authenticate(loginRequest);

        String jwtToken = jwtService.generateToken(authenticatedUser);

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(jwtService.getExpirationTime());
        loginResponse.setUsername(authenticatedUser.getDisplayUsername());

        logger.info("{} logged in successfully", authenticatedUser.getDisplayUsername());

        return ResponseEntity.ok(loginResponse);
    }

    // TODO:
    @GetMapping("/status")
    public ResponseEntity<AuthenticationResponse> isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        boolean isAuthenticated = authentication != null &&
                authentication.isAuthenticated() &&
                !(authentication instanceof AnonymousAuthenticationToken);

        return ResponseEntity.ok(new AuthenticationResponse(isAuthenticated, "User is authenticated"));
    }

    // TODO:
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(
            HttpServletRequest request
    ) {
        String token = extractToken(request);
        if (token != null) {
            authenticationService.logout(token);
            logger.info("Logged out");
            return ResponseEntity.ok(new ApiResponse(true, "Logout successful"));
        }
        return ResponseEntity.badRequest().body(new ApiResponse(false, "Logout failed"));
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        // TODO: throw exception
        return null;
    }
}
