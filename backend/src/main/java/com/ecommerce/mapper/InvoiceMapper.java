package com.ecommerce.mapper;

import com.ecommerce.dto.response.InvoiceResponse;
import com.ecommerce.entity.Invoice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {

    @Mapping(source = "order.orderNumber", target = "orderNumber")
    @Mapping(expression = "java(invoice.getOrder().getUser().getFirstName() + \" \" + invoice.getOrder().getUser().getLastName())", target = "customerName")
    @Mapping(source = "order.user.email", target = "customerEmail")
    InvoiceResponse toResponse(Invoice invoice);
}