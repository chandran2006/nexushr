package com.nexushr.service;

import com.nexushr.dto.request.LoginRequest;
import com.nexushr.dto.request.RegisterRequest;
import com.nexushr.dto.response.AuthResponse;
import com.nexushr.entity.User;
import com.nexushr.exception.DuplicateResourceException;
import com.nexushr.exception.ResourceNotFoundException;
import com.nexushr.repository.UserRepository;
import com.nexushr.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole() != null ? request.getRole() : User.UserRole.EMPLOYEE)
                .status(User.UserStatus.ACTIVE)
                .employeeId(generateEmployeeId())
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());
        auditService.log("USER_REGISTERED", "User", user.getId().toString(), null, user.getEmail(), "New user registration");

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }
        User user = userRepository.findByRefreshTokenAndDeletedFalse(refreshToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired refresh token"));

        if (jwtTokenProvider.isTokenExpired(refreshToken)) {
            throw new IllegalArgumentException("Refresh token has expired");
        }

        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);
        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmailAndDeletedFalse(email).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
        });
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = user.getRefreshToken() != null
                ? user.getRefreshToken()
                : jwtTokenProvider.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .fullName(user.getFullName())
                        .profileImageUrl(user.getProfileImageUrl())
                        .role(user.getRole())
                        .status(user.getStatus())
                        .employeeId(user.getEmployeeId())
                        .lastLoginAt(user.getLastLoginAt())
                        .build())
                .build();
    }

    private String generateEmployeeId() {
        String uniquePart = String.format("%06d", (int)(Math.random() * 900000) + 100000);
        return "EMP" + uniquePart;
    }
}
