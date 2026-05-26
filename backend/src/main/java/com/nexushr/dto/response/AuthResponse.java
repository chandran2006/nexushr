package com.nexushr.dto.response;

import com.nexushr.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserInfo user;

    @Data
    @Builder
    public static class UserInfo {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String profileImageUrl;
        private User.UserRole role;
        private User.UserStatus status;
        private String employeeId;
        private LocalDateTime lastLoginAt;
    }
}
