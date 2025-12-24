package com.ecommerce.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class CalculationUtils {

    private static final int CURRENCY_SCALE = 2;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;

    public static BigDecimal multiply(BigDecimal a, int quantity) {
        return a.multiply(BigDecimal.valueOf(quantity)).setScale(CURRENCY_SCALE, ROUNDING_MODE);
    }

    public static BigDecimal calculatePercentage(BigDecimal amount, BigDecimal percentage) {
        if (amount == null || percentage == null)
            return BigDecimal.ZERO;
        return amount.multiply(percentage)
                .divide(BigDecimal.valueOf(100), CURRENCY_SCALE, ROUNDING_MODE);
    }

    public static BigDecimal add(BigDecimal... amounts) {
        BigDecimal sum = BigDecimal.ZERO;
        for (BigDecimal amount : amounts) {
            if (amount != null) {
                sum = sum.add(amount);
            }
        }
        return sum.setScale(CURRENCY_SCALE, ROUNDING_MODE);
    }

    public static BigDecimal subtract(BigDecimal a, BigDecimal b) {
        return a.subtract(b).max(BigDecimal.ZERO).setScale(CURRENCY_SCALE, ROUNDING_MODE);
    }
}