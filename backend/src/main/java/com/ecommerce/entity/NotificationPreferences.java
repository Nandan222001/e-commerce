package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferences {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long userId;

    private boolean emailNotifications = true;
    private boolean smsNotifications = false;
    private boolean pushNotifications = true;
    private boolean orderUpdates = true;
    private boolean promotionalEmails = true;
    private boolean newsletter = true;
}