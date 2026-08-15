package com.medibridge.core.service;

import com.medibridge.core.dto.ContactMessageDTO;
import java.util.List;

public interface ContactMessageService {
    ContactMessageDTO submitMessage(ContactMessageDTO dto);
    List<ContactMessageDTO> getAllMessages();
    ContactMessageDTO markAsRead(Long id);
}
