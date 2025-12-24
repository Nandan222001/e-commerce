package com.ecommerce.repository;

import com.ecommerce.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    @Query("SELECT i FROM Invoice i WHERE " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:search IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:startDate IS NULL OR i.invoiceDate >= :startDate) AND " +
           "(:endDate IS NULL OR i.invoiceDate <= :endDate)")
    Page<Invoice> findAllWithFilters(String status, String search, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    @Query("SELECT i FROM Invoice i WHERE i.status = 'SENT' OR i.status = 'PARTIALLY_PAID'")
    List<Invoice> findPendingInvoices();
    
    @Query("SELECT i FROM Invoice i WHERE i.dueDate < CURRENT_DATE AND i.status <> 'PAID' AND i.status <> 'CANCELLED'")
    List<Invoice> findOverdueInvoices();
}