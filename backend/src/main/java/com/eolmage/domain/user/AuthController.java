package com.eolmage.domain.user;

import com.eolmage.domain.user.dto.LoginRequest;
import com.eolmage.domain.user.dto.ProfileUpdateRequest;
import com.eolmage.domain.user.dto.SignupRequest;
import com.eolmage.domain.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(authService.getUser(userId));
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<java.util.Map<String, Boolean>> checkNickname(
            @RequestParam String nickname) {
        boolean available = authService.checkNicknameAvailable(nickname);
        return ResponseEntity.ok(java.util.Map.of("available", available));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(authService.updateProfile(userId, request));
    }

    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount(
            @RequestHeader("X-User-Id") Long userId) {
        authService.deleteAccount(userId);
        return ResponseEntity.noContent().build();
    }
}
