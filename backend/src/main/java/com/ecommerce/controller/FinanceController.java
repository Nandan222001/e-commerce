// src/main/java/com/ecommerce/controller/FinanceController.java
package com.ecommerce.controller;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.Invoice;
import com.ecommerce.entity.User;
import com.ecommerce.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.ecommerce.service.FinanceService;
import com.ecommerce.service.InvoiceService;
import com.ecommerce.service.ReportService;
import com.ecommerce.service.TaxService;
import com.ecommerce.service.AuditService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Finance", description = "Finance management APIs")
@PreAuthorize("hasRole('FINANCE') or hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FinanceController {

    private final FinanceService financeService;
    private final InvoiceService invoiceService;
    private final ReportService reportService;
    private final TaxService taxService;
    private final AuditService auditService;

    // Dashboard endpoints
    @GetMapping("/stats")
    @Operation(summary = "Get finance statistics", description = "Get financial dashboard statistics")
    public ResponseEntity<FinanceStatsResponse> getFinanceStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("Fetching finance statistics");

        FinanceStatsResponse stats = financeService.getFinanceStats(startDate, endDate);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue data", description = "Get revenue data for charts")
    public ResponseEntity<List<RevenueDataResponse>> getRevenueData(
            @RequestParam(defaultValue = "MONTHLY") String period,
            @RequestParam(defaultValue = "12") int dataPoints) {

        log.info("Fetching revenue data for period: {}, points: {}", period, dataPoints);

        List<RevenueDataResponse> revenueData = financeService.getRevenueData(period, dataPoints);

        return ResponseEntity.ok(revenueData);
    }

    @GetMapping("/cash-flow")
    @Operation(summary = "Get cash flow", description = "Get cash flow analysis")
    public ResponseEntity<CashFlowResponse> getCashFlow(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("Fetching cash flow analysis");

        CashFlowResponse cashFlow = financeService.getCashFlowAnalysis(startDate, endDate);

        return ResponseEntity.ok(cashFlow);
    }

    // Invoice endpoints
    @GetMapping("/invoices")
    @Operation(summary = "Get all invoices", description = "Get paginated list of invoices")
    public ResponseEntity<Page<InvoiceResponse>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("Fetching invoices - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size);

        Page<InvoiceResponse> invoices = invoiceService.getAllInvoices(
                status, search, startDate, endDate, pageable);

        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/invoices/{invoiceId}")
    @Operation(summary = "Get invoice details", description = "Get detailed invoice information")
    public ResponseEntity<InvoiceResponse> getInvoiceDetails(@PathVariable Long invoiceId) {
        log.info("Fetching invoice details for: {}", invoiceId);

        InvoiceResponse invoice = invoiceService.getInvoiceDetails(invoiceId);

        return ResponseEntity.ok(invoice);
    }

    @PostMapping("/invoices")
    @Operation(summary = "Create invoice", description = "Create a new invoice")
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Valid @RequestBody CreateInvoiceRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Creating invoice by user: {}", user.getEmail());

        InvoiceResponse invoice = invoiceService.createInvoice(request, user);

        auditService.logAction("INVOICE_CREATED",
                "Invoice created: " + invoice.getInvoiceNumber(), user);

        return ResponseEntity.ok(invoice);
    }

    @PutMapping("/invoices/{invoiceId}")
    @Operation(summary = "Update invoice", description = "Update invoice details")
    public ResponseEntity<InvoiceResponse> updateInvoice(
            @PathVariable Long invoiceId,
            @Valid @RequestBody UpdateInvoiceRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Updating invoice {} by user: {}", invoiceId, user.getEmail());

        InvoiceResponse invoice = invoiceService.updateInvoice(invoiceId, request);

        auditService.logAction("INVOICE_UPDATED",
                "Invoice updated: " + invoice.getInvoiceNumber(), user);

        return ResponseEntity.ok(invoice);
    }

    @PostMapping("/invoices/{invoiceId}/send")
    @Operation(summary = "Send invoice", description = "Send invoice to customer via email")
    public ResponseEntity<Map<String, String>> sendInvoice(
            @PathVariable Long invoiceId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = request.get("email");

        log.info("Sending invoice {} to {} by user: {}", invoiceId, email, user.getEmail());

        invoiceService.sendInvoice(invoiceId, email);

        auditService.logAction("INVOICE_SENT",
                String.format("Invoice %d sent to %s", invoiceId, email), user);

        return ResponseEntity.ok(Map.of("message", "Invoice sent successfully"));
    }

    @PatchMapping("/invoices/{invoiceId}/mark-paid")
    @Operation(summary = "Mark invoice as paid", description = "Mark an invoice as paid")
    public ResponseEntity<InvoiceResponse> markInvoiceAsPaid(
            @PathVariable Long invoiceId,
            @RequestBody Map<String, Object> paymentDetails,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Marking invoice {} as paid by user: {}", invoiceId, user.getEmail());

        InvoiceResponse invoice = invoiceService.markAsPaid(invoiceId, paymentDetails);

        auditService.logAction("INVOICE_PAID",
                "Invoice marked as paid: " + invoice.getInvoiceNumber(), user);

        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/invoices/{invoiceId}/download")
    @Operation(summary = "Download invoice PDF", description = "Download invoice as PDF")
    public ResponseEntity<ByteArrayResource> downloadInvoicePdf(@PathVariable Long invoiceId) {
        log.info("Downloading invoice PDF for: {}", invoiceId);

        byte[] pdfData = invoiceService.generateInvoicePdf(invoiceId);

        ByteArrayResource resource = new ByteArrayResource(pdfData);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice_" + invoiceId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfData.length)
                .body(resource);
    }

    @GetMapping("/invoices/pending")
    @Operation(summary = "Get pending invoices", description = "Get list of pending invoices")
    public ResponseEntity<List<InvoiceResponse>> getPendingInvoices() {
        log.info("Fetching pending invoices");

        List<InvoiceResponse> invoices = invoiceService.getPendingInvoices();

        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/invoices/overdue")
    @Operation(summary = "Get overdue invoices", description = "Get list of overdue invoices")
    public ResponseEntity<List<InvoiceResponse>> getOverdueInvoices() {
        log.info("Fetching overdue invoices");

        List<InvoiceResponse> invoices = invoiceService.getOverdueInvoices();

        return ResponseEntity.ok(invoices);
    }

    // Tax endpoints
    @GetMapping("/tax/summary")
    @Operation(summary = "Get tax summary", description = "Get tax collection summary")
    public ResponseEntity<TaxSummaryResponse> getTaxSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("Fetching tax summary");

        TaxSummaryResponse taxSummary = taxService.getTaxSummary(startDate, endDate);

        return ResponseEntity.ok(taxSummary);
    }

    @GetMapping("/tax/gst-report")
    @Operation(summary = "Get GST report", description = "Get detailed GST report")
    public ResponseEntity<GstReportResponse> getGstReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("Generating GST report from {} to {}", startDate, endDate);

        GstReportResponse gstReport = taxService.generateGstReport(startDate, endDate);

        return ResponseEntity.ok(gstReport);
    }

    // Report endpoints
    @GetMapping("/reports/sales")
    @Operation(summary = "Get sales report", description = "Generate sales report")
    public ResponseEntity<SalesReportResponse> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String groupBy) {

        log.info("Generating sales report from {} to {}", startDate, endDate);

        SalesReportResponse report = reportService.generateSalesReport(startDate, endDate, groupBy);

        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/profit-loss")
    @Operation(summary = "Get profit/loss report", description = "Generate profit and loss statement")
    public ResponseEntity<ProfitLossReportResponse> getProfitLossReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("Generating profit/loss report from {} to {}", startDate, endDate);

        ProfitLossReportResponse report = reportService.generateProfitLossReport(startDate, endDate);

        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/customer-revenue")
    @Operation(summary = "Get customer revenue report", description = "Get revenue by customer report")
    public ResponseEntity<List<CustomerRevenueResponse>> getCustomerRevenueReport(
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Generating customer revenue report");

        List<CustomerRevenueResponse> report = reportService.getTopCustomersByRevenue(limit);

        return ResponseEntity.ok(report);
    }

    @PostMapping("/reports/export")
    @Operation(summary = "Export financial report", description = "Export report in various formats")
    public ResponseEntity<ByteArrayResource> exportReport(
            @Valid @RequestBody ExportReportRequest request) {

        log.info("Exporting {} report in {} format", request.getReportType(), request.getFormat());

        byte[] reportData = reportService.exportReport(request);

        String filename = String.format("%s_%s.%s",
                request.getReportType(),
                LocalDate.now(),
                request.getFormat().toLowerCase());

        ByteArrayResource resource = new ByteArrayResource(reportData);

        MediaType mediaType = request.getFormat().equals("PDF")
                ? MediaType.APPLICATION_PDF
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(mediaType)
                .contentLength(reportData.length)
                .body(resource);
    }

    // Payment reconciliation
    @GetMapping("/payments/pending")
    @Operation(summary = "Get pending payments", description = "Get list of pending payments")
    public ResponseEntity<List<PendingPaymentResponse>> getPendingPayments() {
        log.info("Fetching pending payments");

        List<PendingPaymentResponse> payments = financeService.getPendingPayments();

        return ResponseEntity.ok(payments);
    }

    @PostMapping("/payments/reconcile")
    @Operation(summary = "Reconcile payments", description = "Reconcile payment transactions")
    public ResponseEntity<ReconciliationResponse> reconcilePayments(
            @Valid @RequestBody ReconciliationRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        log.info("Reconciling payments by user: {}", user.getEmail());

        ReconciliationResponse result = financeService.reconcilePayments(request);

        auditService.logAction("PAYMENTS_RECONCILED",
                String.format("Reconciled %d payments", result.getReconciledCount()), user);

        return ResponseEntity.ok(result);
    }
}