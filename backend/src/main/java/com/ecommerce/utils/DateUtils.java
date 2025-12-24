package com.ecommerce.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class DateUtils {

    private static final String DATE_PATTERN = "dd-MM-yyyy";
    private static final String DATE_TIME_PATTERN = "dd-MM-yyyy HH:mm:ss";
    private static final String INVOICE_DATE_PATTERN = "dd MMM yyyy";

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(DATE_PATTERN);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern(DATE_TIME_PATTERN);
    private static final DateTimeFormatter INVOICE_FORMATTER = DateTimeFormatter.ofPattern(INVOICE_DATE_PATTERN);

    public static String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : null;
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_TIME_FORMATTER) : null;
    }

    public static String formatForInvoice(LocalDate date) {
        return date != null ? date.format(INVOICE_FORMATTER) : null;
    }

    public static LocalDate parseDate(String dateString) {
        return dateString != null ? LocalDate.parse(dateString, DATE_FORMATTER) : null;
    }

    public static long daysBetween(LocalDate start, LocalDate end) {
        return ChronoUnit.DAYS.between(start, end);
    }

    public static boolean isDateInRange(LocalDate date, LocalDate start, LocalDate end) {
        return (date.isEqual(start) || date.isAfter(start)) &&
                (date.isEqual(end) || date.isBefore(end));
    }
}