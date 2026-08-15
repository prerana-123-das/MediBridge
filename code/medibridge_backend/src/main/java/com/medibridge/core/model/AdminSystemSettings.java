package com.medibridge.core.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA Entity representing Global System Settings managed by the Admin.
 */
@Entity
@Table(name = "admin_system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSystemSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "setting_id")
    private Integer settingId;

    @Column(name = "platform_name", length = 100)
    @Builder.Default
    private String platformName = "MediBridge";

    @Column(name = "support_email", length = 100)
    @Builder.Default
    private String supportEmail = "support@medibridge.com";

    @Column(name = "max_appointments_per_day")
    @Builder.Default
    private Integer maxAppointmentsPerDay = 50;

    @Column(name = "session_timeout", length = 20)
    @Builder.Default
    private String sessionTimeout = "30 minutes";

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
