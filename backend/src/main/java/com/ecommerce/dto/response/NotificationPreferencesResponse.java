package com.ecommerce.dto.response;

import lombok.Data;

@Data
public class NotificationPreferencesResponse {
    private boolean emailNotifications;
    private boolean smsNotifications;
    private boolean pushNotifications;
    private boolean orderUpdates;
    private boolean promotionalEmails;
    private boolean newsletter;
}