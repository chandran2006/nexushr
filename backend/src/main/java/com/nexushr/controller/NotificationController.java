package com.nexushr.controller;

import com.nexushr.dto.response.ApiResponse;
import com.nexushr.entity.Notification;
import com.nexushr.security.SecurityUtils;
import com.nexushr.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management")
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get my notifications")
    public ResponseEntity<ApiResponse<Page<Notification>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUserNotifications(user.getId(), page, size)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount() {
        var user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", notificationService.getUnreadCount(user.getId()))));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all as read")
    public ResponseEntity<ApiResponse<Void>> readAll() {
        var user = securityUtils.getCurrentUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<Void>> read(@PathVariable UUID id) {
        var user = securityUtils.getCurrentUser();
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }
}
