package com.medibridge.core.controller;

import com.medibridge.core.service.GoogleCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/oauth2")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GoogleOAuthController {

    private final GoogleCalendarService googleCalendarService;

    @GetMapping("/authorize")
    public ResponseEntity<Void> authorize(@RequestParam("doctorId") String doctorId) {
        String url = googleCalendarService.getAuthorizationUrl(doctorId);
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(url)).build();
    }

    @GetMapping("/callback")
    public ResponseEntity<String> callback(@RequestParam("code") String code, @RequestParam("state") String doctorId) {
        try {
            googleCalendarService.exchangeCodeForTokens(code, doctorId);
            return ResponseEntity.ok("Successfully authenticated with Google as Doctor ID " + doctorId + ". You may now close this window.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to authenticate: " + e.getMessage());
        }
    }
}
