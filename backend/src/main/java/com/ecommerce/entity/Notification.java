package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String title;
    private String message;
    private String type; // ORDER, SYSTEM, PROMOTION

    @Column(name = "is_read")
    private boolean read = false;

    private LocalDateTime readAt;

    // Link to entity if needed
    private String referenceType;
    private Long referenceId;
}