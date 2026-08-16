package com.medibridge.core.service;

import com.medibridge.core.dto.AppointmentEventDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, AppointmentEventDTO> kafkaTemplate;
    private static final String TOPIC = "appointment-events";

    public void publishAppointmentEvent(AppointmentEventDTO event) {
        log.info(String.format("Producing AppointmentEvent to Kafka: %s", event));
        kafkaTemplate.send(TOPIC, String.valueOf(event.getAppointmentId()), event);
    }
}
