package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notification_preferences")
@Data // Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Use this if UserService calls setUserId(Long)
    @Column(name = "user_id", unique = true)
    private Long userId;

    // Alternatively, if you want to link to User entity:
    // @OneToOne
    // @JoinColumn(name = "user_id", referencedColumnName = "id")
    // private User user;
    // BUT UserService is calling setUserId(Long), so keep the Long field above.

    @Column(columnDefinition = "boolean default true")
    private boolean emailNotifications;

    @Column(columnDefinition = "boolean default false")
    private boolean smsNotifications;

    @Column(columnDefinition = "boolean default true")
    private boolean pushNotifications;

    @Column(columnDefinition = "boolean default true")
    private boolean orderUpdates;

    @Column(columnDefinition = "boolean default true")
    private boolean promotionalEmails;

    @Column(columnDefinition = "boolean default true")
    private boolean newsletter;
}