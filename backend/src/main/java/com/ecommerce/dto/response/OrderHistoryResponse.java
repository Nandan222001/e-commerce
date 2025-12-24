package com.ecommerce.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class OrderHistoryResponse {
    private List<OrderResponse> orders;
    private Integer currentPage;
    private Integer totalPages;
    private Long totalElements;
}