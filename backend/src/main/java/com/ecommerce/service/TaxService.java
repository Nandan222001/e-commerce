package com.ecommerce.service;

import com.ecommerce.dto.response.GstReportResponse;
import com.ecommerce.dto.response.TaxSummaryResponse;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class TaxService {
    public TaxSummaryResponse getTaxSummary(LocalDate start, LocalDate end) { return null; }
    public GstReportResponse generateGstReport(LocalDate start, LocalDate end) { return null; }
}