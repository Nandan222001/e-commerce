package com.ecommerce.mapper;

import com.ecommerce.dto.response.NotificationPreferencesResponse;
import com.ecommerce.dto.response.NotificationResponse;
import com.ecommerce.entity.Notification;
import com.ecommerce.entity.NotificationPreferences;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationResponse toResponse(Notification notification);

    NotificationPreferencesResponse toPreferencesResponse(NotificationPreferences preferences);
}