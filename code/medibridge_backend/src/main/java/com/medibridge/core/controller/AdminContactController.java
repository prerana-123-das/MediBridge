package com.medibridge.core.controller;

import com.medibridge.core.dto.ApiResponse;
import com.medibridge.core.dto.ContactMessageDTO;
import com.medibridge.core.service.ContactMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/contact-messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminContactController {

    private final ContactMessageService contactMessageService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllMessages() {
        List<ContactMessageDTO> messages = contactMessageService.getAllMessages();
        return ResponseEntity.ok(new ApiResponse("Messages retrieved", true, messages));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id) {
        ContactMessageDTO updated = contactMessageService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse("Message marked as read", true, updated));
    }
}
