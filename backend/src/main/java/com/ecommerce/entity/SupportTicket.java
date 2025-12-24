package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "support_tickets")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicket extends BaseEntity {

    @Column(unique = true)
    private String ticketNumber;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String subject;
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
    private String priority; // LOW, MEDIUM, HIGH
    private String category;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL)
    private List<TicketMessage> messages = new ArrayList<>();
}