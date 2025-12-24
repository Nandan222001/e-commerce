package com.ecommerce.utils;

import com.ecommerce.entity.Address;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

public class GstUtils {

    /**
     * Checks if the transaction is intra-state (within same state) or inter-state.
     * Based on GST Number format (first 2 digits are state code) or Address state.
     */
    public static boolean isIntraState(String companyGstNumber, Address shippingAddress) {
        if (companyGstNumber == null || companyGstNumber.length() < 2) {
            // Fallback to state name comparison if GST not provided (B2C)
            // This requires a standardized state mapping, simplified here for example
            return isSameStateByName(shippingAddress.getState());
        }

        String customerStateCode = companyGstNumber.substring(0, 2);
        return AppConstants.HOME_STATE_CODE.equals(customerStateCode);
    }

    private static boolean isSameStateByName(String stateName) {
        // In a real app, map State Names to GST Codes.
        // Example: "Maharashtra" -> "27"
        return "Maharashtra".equalsIgnoreCase(stateName);
    }

    /**
     * Calculates tax breakup.
     * Returns a map containing: CGST, SGST, IGST, TotalTax
     */
    public static Map<String, BigDecimal> calculateTaxBreakup(BigDecimal amount, BigDecimal gstRate,
            boolean isIntraState) {
        Map<String, BigDecimal> taxMap = new HashMap<>();

        BigDecimal totalTax = amount.multiply(gstRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        if (isIntraState) {
            BigDecimal halfTax = totalTax.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            taxMap.put("CGST", halfTax);
            taxMap.put("SGST", halfTax);
            taxMap.put("IGST", BigDecimal.ZERO);
        } else {
            taxMap.put("CGST", BigDecimal.ZERO);
            taxMap.put("SGST", BigDecimal.ZERO);
            taxMap.put("IGST", totalTax);
        }

        taxMap.put("TotalTax", totalTax);
        return taxMap;
    }

    public static BigDecimal calculateInclusivePrice(BigDecimal mrp, BigDecimal gstRate) {
        // Formula: Price = MRP / (1 + Rate/100)
        BigDecimal divisor = BigDecimal.ONE.add(gstRate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        return mrp.divide(divisor, 2, RoundingMode.HALF_UP);
    }
}