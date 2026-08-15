package com.medibridge.core.service.impl;

import com.medibridge.core.dto.ContactMessageDTO;
import com.medibridge.core.model.ContactMessage;
import com.medibridge.core.repository.ContactMessageRepository;
import com.medibridge.core.service.ContactMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactMessageServiceImpl implements ContactMessageService {

    private final ContactMessageRepository repository;

    @Override
    @Transactional
    public ContactMessageDTO submitMessage(ContactMessageDTO dto) {
        ContactMessage message = ContactMessage.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .subject(dto.getSubject())
                .message(dto.getMessage())
                .isRead(false)
                .build();
                
        ContactMessage saved = repository.save(message);
        return mapToDTO(saved);
    }

    @Override
    public List<ContactMessageDTO> getAllMessages() {
        return repository.findAllByOrderBySubmittedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ContactMessageDTO markAsRead(Long id) {
        ContactMessage message = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        message.setRead(true);
        return mapToDTO(repository.save(message));
    }

    private ContactMessageDTO mapToDTO(ContactMessage message) {
        return ContactMessageDTO.builder()
                .id(message.getId())
                .name(message.getName())
                .email(message.getEmail())
                .subject(message.getSubject())
                .message(message.getMessage())
                .submittedAt(message.getSubmittedAt())
                .isRead(message.isRead())
                .build();
    }
}
