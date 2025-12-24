package com.ecommerce.mapper;

import com.ecommerce.dto.response.LoyaltyPointsResponse;
import com.ecommerce.dto.response.PointsTransactionResponse;
import com.ecommerce.dto.response.RedemptionResponse;
import com.ecommerce.entity.LoyaltyPoints;
import com.ecommerce.entity.LoyaltyRedemption;
import com.ecommerce.entity.LoyaltyTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LoyaltyMapper {

    @Mapping(target = "pointsToNextTier", ignore = true) // Calculated in service
    LoyaltyPointsResponse toResponse(LoyaltyPoints loyaltyPoints);

    @Mapping(source = "createdAt", target = "date")
    @Mapping(target = "referenceId", ignore = true) // Usually needs custom mapping logic
    PointsTransactionResponse toTransactionResponse(LoyaltyTransaction transaction);

    @Mapping(source = "createdAt", target = "redeemedAt")
    @Mapping(source = "points", target = "pointsRedeemed")
    RedemptionResponse toResponse(LoyaltyRedemption redemption);
}