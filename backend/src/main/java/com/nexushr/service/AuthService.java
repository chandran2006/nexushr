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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    @Value("${app.max-login-attempts:5}")
    private int maxLoginAttempts;

    @Value("${app.lockout-duration-minutes:30}")
    private int lockoutDurationMinutes;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    // Thread-safe sequence for employee ID generation
    private static final AtomicLong EMP_SEQUENCE = new AtomicLong(System.currentTimeMillis() % 900000 + 100000);

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmailAndDeletedFalse(email)) {
            throw new DuplicateResourceException("Email already registered: " + email);
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole() != null ? request.getRole() : User.UserRole.EMPLOYEE)
                .status(User.UserStatus.ACTIVE)
                .employeeId(generateEmployeeId())
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());
        auditService.log("USER_REGISTERED", "User", user.getId().toString(),
                null, user.getEmail(), "New user registration");

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        // Check lockout before attempting authentication
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (user.isAccountLocked()) {
            throw new LockedException("Account locked until " + user.getLockedUntil());
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (Exception ex) {
            handleFailedLogin(user);
            throw ex;
        }

        // Successful login — reset counters
        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);

        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("User logged in: {}", user.getEmail());
        auditService.log("USER_LOGIN", "User", user.getId().toString(),
                null, user.getEmail(), "Successful login");
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
            user.setRefreshToken(null);
            userRepository.save(user);
            throw new IllegalArgumentException("Refresh token has expired. Please login again.");
        }

        // Rotate refresh token on every use (prevents replay attacks)
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
            auditService.log("USER_LOGOUT", "User", user.getId().toString(),
                    null, user.getEmail(), "User logged out");
        });
    }

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= maxLoginAttempts) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
            log.warn("Account locked after {} failed attempts: {}", attempts, user.getEmail());
            auditService.log("ACCOUNT_LOCKED", "User", user.getId().toString(),
                    null, user.getEmail(), "Account locked after " + attempts + " failed attempts");
        }
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        // Use existing refresh token if present, otherwise generate one
        String refreshToken = (user.getRefreshToken() != null && !user.getRefreshToken().isBlank())
                ? user.getRefreshToken()
                : jwtTokenProvider.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
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
        // Thread-safe, collision-resistant employee ID
        long seq = EMP_SEQUENCE.incrementAndGet() % 900000 + 100000;
        String candidate = "EMP" + String.format("%06d", seq);
        // Ensure uniqueness in DB
        int retries = 0;
        while (userRepository.existsByEmployeeId(candidate) && retries++ < 10) {
            seq = EMP_SEQUENCE.incrementAndGet() % 900000 + 100000;
            candidate = "EMP" + String.format("%06d", seq);
        }
        return candidate;
    }
}
