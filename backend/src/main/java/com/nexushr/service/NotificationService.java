package com.nexushr.service;

import com.nexushr.entity.Notification;
import com.nexushr.entity.User;
import com.nexushr.repository.NotificationRepository;
import com.nexushr.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                                UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Async
    @Transactional
    public void notifyUser(UUID userId, String title, String message, UUID referenceId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notification = Notification.builder()
                .user(user).title(title).message(message)
                .type(Notification.NotificationType.SYSTEM)
                .referenceId(referenceId)
                .build();

        notification = notificationRepository.save(notification);
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSendToUser(user.getEmail(), "/queue/notifications", notification);
        }
    }

    @Async
    @Transactional
    public void notifyHRManagers(String title, String message, UUID referenceId) {
        List<User> hrManagers = userRepository.findByRoleInAndDeletedFalse(
                List.of(User.UserRole.HR_ADMIN, User.UserRole.HR_MANAGER));
        hrManagers.forEach(m -> notifyUser(m.getId(), title, message, referenceId));
    }

    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(UUID userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        notificationRepository.markAsRead(notificationId, userId);
    }
}
