package com.ecommerce.dto.request;

import lombok.Data;

@Data
public class NotificationPreferencesRequest {
    private boolean emailNotifications;
    private boolean smsNotifications;
    private boolean pushNotifications;
    private boolean orderUpdates;
    private boolean promotionalEmails;
    private boolean newsletter;
}