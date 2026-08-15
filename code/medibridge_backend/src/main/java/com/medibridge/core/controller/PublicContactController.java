package com.medibridge.core.controller;

import com.medibridge.core.dto.ApiResponse;
import com.medibridge.core.dto.ContactMessageDTO;
import com.medibridge.core.service.ContactMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicContactController {

    private final ContactMessageService contactMessageService;

    @PostMapping("/contact")
    public ResponseEntity<ApiResponse> submitContactMessage(@RequestBody ContactMessageDTO dto) {
        ContactMessageDTO saved = contactMessageService.submitMessage(dto);
        return ResponseEntity.ok(new ApiResponse("Message submitted successfully", true, saved));
    }
}
