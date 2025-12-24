package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ExportReportRequest {
    @NotBlank(message = "Report type is required")
    private String reportType; // SALES, INVENTORY, TAX, USER

    @NotBlank(message = "Format is required")
    private String format; // PDF, CSV, EXCEL

    private LocalDate startDate;
    private LocalDate endDate;
    private String filter;
}