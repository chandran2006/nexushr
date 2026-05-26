package com.nexushr.security;

import com.nexushr.entity.User;
import com.nexushr.exception.AccessDeniedException;
import com.nexushr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("No authenticated user found");
        }
        String email = auth.getName();
        return userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found in database"));
    }

    public Optional<User> getCurrentUserOptional() {
        try {
            return Optional.of(getCurrentUser());
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public boolean hasRole(User.UserRole role) {
        User user = getCurrentUser();
        return user.getRole() == role;
    }

    public boolean isAdminOrHR() {
        User user = getCurrentUser();
        return user.getRole() == User.UserRole.SUPER_ADMIN
                || user.getRole() == User.UserRole.HR_ADMIN
                || user.getRole() == User.UserRole.HR_MANAGER;
    }

    public boolean canAccessEmployee(String employeeId) {
        User user = getCurrentUser();
        if (isAdminOrHR()) return true;
        return user.getEmployeeId() != null && user.getEmployeeId().equals(employeeId);
    }
}
