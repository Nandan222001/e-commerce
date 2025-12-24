package com.ecommerce.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ReferralInfoResponse {
    private String referralCode;
    private String referralLink;
    private Integer totalReferrals;
    private Integer successfulReferrals;
    private BigDecimal totalEarnings;
    private List<ReferralHistoryResponse> history;

    @Data
    public static class ReferralHistoryResponse {
        private String referredUser; // Masked name/email
        private String status; // PENDING, COMPLETED
        private BigDecimal reward;
        private String date;
    }
}