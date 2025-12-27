package com.ecommerce.service;

import com.ecommerce.dto.request.CreateInvoiceRequest;
import com.ecommerce.dto.request.UpdateInvoiceRequest;
import com.ecommerce.dto.response.InvoiceResponse;
import com.ecommerce.entity.Invoice;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.User;
import com.ecommerce.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    /**
     * ✅ FIXED: Proper invoice generation for OrderService
     */
    public Invoice generateInvoice(Order order) {

        if (order == null) {
            throw new IllegalArgumentException("Order must not be null while generating invoice");
        }

        Invoice invoice = new Invoice();
        invoice.setOrder(order);                       // ✅ CRITICAL FIX
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setTotalAmount(order.getTotalAmount());
        invoice.setStatus(Invoice.InvoiceStatus.DRAFT);
        invoice.setCreatedAt(LocalDateTime.now());

        return invoiceRepository.save(invoice);
    }

    /* ===================== LEAVE BELOW AS-IS (STUBS) ===================== */

    public byte[] generateInvoicePdf(Long invoiceId) {
        return new byte[0];
    }

    public Page<InvoiceResponse> getAllInvoices(
            String status,
            String search,
            LocalDate start,
            LocalDate end,
            Pageable pageable) {
        return Page.empty();
    }

    public InvoiceResponse getInvoiceDetails(Long id) {
        return null;
    }

    public InvoiceResponse createInvoice(CreateInvoiceRequest request, User user) {
        return null;
    }

    public InvoiceResponse updateInvoice(Long id, UpdateInvoiceRequest request) {
        return null;
    }

    public void sendInvoice(Long id, String email) {
    }

    public InvoiceResponse markAsPaid(Long id, Map<String, Object> details) {
        return null;
    }

    public List<InvoiceResponse> getPendingInvoices() {
        return List.of();
    }

    public List<InvoiceResponse> getOverdueInvoices() {
        return List.of();
    }

    /* ===================== INTERNAL ===================== */

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }
}
