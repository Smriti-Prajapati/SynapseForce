package com.synapseforce.message;

import com.synapseforce.notification.Notification;
import com.synapseforce.notification.NotificationRepository;
import com.synapseforce.user.Role;
import com.synapseforce.user.User;
import com.synapseforce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @PostMapping("/send/{receiverId}")
    public ResponseEntity<Map<String, Object>> send(
            @PathVariable Long receiverId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal) {

        User sender = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Message msg = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(body.get("content"))
                .build();

        Message saved = messageRepository.save(msg);

        // Create a notification for the receiver
        String preview = saved.getContent().length() > 50
                ? saved.getContent().substring(0, 50) + "..."
                : saved.getContent();
        notificationRepository.save(Notification.builder()
                .userId(receiver.getId())
                .message("New message from " + sender.getFullName() + ": \"" + preview + "\"")
                .build());

        return ResponseEntity.ok(toDto(saved));
    }

    @GetMapping("/conversation/{otherId}")
    public ResponseEntity<List<Map<String, Object>>> getConversation(
            @PathVariable Long otherId,
            @AuthenticationPrincipal UserDetails principal) {

        User me = userRepository.findByEmail(principal.getUsername()).orElseThrow();

        List<Message> messages;
        if (me.getRole() == com.synapseforce.user.Role.ADMIN) {
            // Admin sees ALL messages between the employee and ANY admin
            List<Long> adminIds = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == com.synapseforce.user.Role.ADMIN)
                    .map(User::getId)
                    .toList();
            messages = messageRepository.findAll().stream()
                    .filter(m ->
                        (m.getSender().getId().equals(otherId) && adminIds.contains(m.getReceiver().getId())) ||
                        (m.getReceiver().getId().equals(otherId) && adminIds.contains(m.getSender().getId()))
                    )
                    .sorted((a, b) -> a.getSentAt().compareTo(b.getSentAt()))
                    .toList();
        } else {
            messages = messageRepository.findConversation(me.getId(), otherId);
        }

        // Mark messages received by me as read
        messages.stream()
                .filter(m -> m.getReceiver().getId().equals(me.getId()) && !m.isRead())
                .forEach(m -> { m.setRead(true); messageRepository.save(m); });

        return ResponseEntity.ok(messages.stream().map(this::toDto).toList());
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations(
            @AuthenticationPrincipal UserDetails principal) {

        User me = userRepository.findByEmail(principal.getUsername()).orElseThrow();

        // If admin, show ALL messages sent to ANY admin (shared inbox)
        List<Message> all;
        if (me.getRole() == com.synapseforce.user.Role.ADMIN) {
            // Get all admin user IDs
            List<Long> adminIds = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == com.synapseforce.user.Role.ADMIN)
                    .map(User::getId)
                    .toList();
            // Get all messages involving any admin
            all = messageRepository.findAll().stream()
                    .filter(m -> adminIds.contains(m.getSender().getId())
                            || adminIds.contains(m.getReceiver().getId()))
                    .sorted((a, b) -> b.getSentAt().compareTo(a.getSentAt()))
                    .toList();
        } else {
            all = messageRepository.findAllInvolving(me.getId());
        }

        // Deduplicate non-admin partners
        Map<Long, User> partnerMap = new LinkedHashMap<>();
        List<Long> adminIds = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.synapseforce.user.Role.ADMIN)
                .map(User::getId)
                .toList();

        for (Message m : all) {
            User sender = m.getSender();
            User receiver = m.getReceiver();
            // The "partner" is whichever side is NOT an admin
            User partner = adminIds.contains(sender.getId()) ? receiver : sender;
            if (!adminIds.contains(partner.getId())) {
                partnerMap.putIfAbsent(partner.getId(), partner);
            }
        }

        List<Map<String, Object>> result = partnerMap.values().stream()
                .map(p -> {
                    long unread = messageRepository
                            .countBySenderIdAndReceiverIdAndReadFalse(p.getId(), me.getId());
                    return Map.<String, Object>of(
                        "userId", p.getId(),
                        "fullName", p.getFullName(),
                        "email", p.getEmail(),
                        "unreadCount", unread
                    );
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdmin() {
        User admin = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No admin found"));
        return ResponseEntity.ok(Map.of(
            "id", admin.getId(),
            "fullName", admin.getFullName()
        ));
    }

    // Returns a plain map — no User entity serialization, no circular refs
    private Map<String, Object> toDto(Message m) {
        return Map.of(
            "id", m.getId(),
            "content", m.getContent(),
            "sentAt", m.getSentAt().toString(),
            "read", m.isRead(),
            "senderId", m.getSender().getId(),
            "senderName", m.getSender().getFullName(),
            "receiverId", m.getReceiver().getId(),
            "receiverName", m.getReceiver().getFullName()
        );
    }
}
