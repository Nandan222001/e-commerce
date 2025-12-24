package com.ecommerce.service;

import com.ecommerce.dto.request.ExportReportRequest;
import com.ecommerce.dto.response.CustomerRevenueResponse;
import com.ecommerce.dto.response.ProfitLossReportResponse;
import com.ecommerce.dto.response.SalesReportResponse;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReportService {
    public SalesReportResponse generateSalesReport(LocalDate start, LocalDate end, String groupBy) { return null; }
    public ProfitLossReportResponse generateProfitLossReport(LocalDate start, LocalDate end) { return null; }
    public List<CustomerRevenueResponse> getTopCustomersByRevenue(int limit) { return List.of(); }
    public byte[] exportReport(ExportReportRequest request) { return new byte[0]; }
}