    -- Create database
    CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    USE ecommerce_db;

    -- Roles table
    CREATE TABLE roles (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Users table
    CREATE TABLE users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) UNIQUE,
        customer_type ENUM('BUSINESS', 'INDIVIDUAL') NOT NULL,
        company_name VARCHAR(255),
        gst_number VARCHAR(50),
        active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_customer_type (customer_type)
    );

    -- User roles junction table
    CREATE TABLE user_roles (
        user_id BIGINT NOT NULL,
        role_id BIGINT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );

    -- Categories table
    CREATE TABLE categories (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        parent_id BIGINT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_parent (parent_id)
    );

    -- Products table
    CREATE TABLE products (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        part_number VARCHAR(100) UNIQUE,
        category_id BIGINT,
        base_price DECIMAL(10,2) NOT NULL,
        business_price DECIMAL(10,2),
        stock_quantity INT DEFAULT 0,
        min_stock_level INT DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        gst_applicable BOOLEAN DEFAULT TRUE,
        gst_rate DECIMAL(5,2) DEFAULT 18.00,
        unit VARCHAR(20) DEFAULT 'PIECE',
        weight DECIMAL(10,3),
        dimensions VARCHAR(100),
        manufacturer VARCHAR(255),
        brand VARCHAR(100),
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_sku (sku),
        INDEX idx_name (name),
        INDEX idx_part_number (part_number),
        INDEX idx_category (category_id),
        INDEX idx_active (active)
    );

    -- Product images table
    CREATE TABLE product_images (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product (product_id)
    );

    -- Addresses table
    CREATE TABLE addresses (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        type ENUM('SHIPPING', 'BILLING', 'BOTH') DEFAULT 'BOTH',
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'India',
        postal_code VARCHAR(20) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id)
    );

    -- Orders table
    CREATE TABLE orders (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        user_id BIGINT NOT NULL,
        status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 
                    'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'RETURNED') 
                    DEFAULT 'PENDING',
        payment_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 
                            'REFUNDED', 'PARTIALLY_REFUNDED') DEFAULT 'PENDING',
        payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'UPI', 
                            'WALLET', 'COD', 'BANK_TRANSFER', 'CREDIT'),
        subtotal DECIMAL(10,2) NOT NULL,
        cgst_amount DECIMAL(10,2) DEFAULT 0,
        sgst_amount DECIMAL(10,2) DEFAULT 0,
        igst_amount DECIMAL(10,2) DEFAULT 0,
        total_tax DECIMAL(10,2) NOT NULL DEFAULT 0,
        shipping_charge DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        shipping_address_id BIGINT,
        billing_address_id BIGINT,
        customer_notes TEXT,
        internal_notes TEXT,
        tracking_number VARCHAR(100),
        estimated_delivery_date TIMESTAMP NULL,
        actual_delivery_date TIMESTAMP NULL,
        processed_by BIGINT,
        processed_at TIMESTAMP NULL,
        approved_by BIGINT,
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (shipping_address_id) REFERENCES addresses(id),
        FOREIGN KEY (billing_address_id) REFERENCES addresses(id),
        FOREIGN KEY (processed_by) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id),
        INDEX idx_order_number (order_number),
        INDEX idx_user (user_id),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_created_at (created_at)
    );

    -- Order items table
    CREATE TABLE order_items (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_sku VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id),
        INDEX idx_order (order_id),
        INDEX idx_product (product_id)
    );

    -- Invoices table
    CREATE TABLE invoices (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(50) NOT NULL UNIQUE,
        order_id BIGINT NOT NULL UNIQUE,
        invoice_date DATE NOT NULL,
        due_date DATE,
        subtotal DECIMAL(10,2) NOT NULL,
        cgst_amount DECIMAL(10,2) DEFAULT 0,
        sgst_amount DECIMAL(10,2) DEFAULT 0,
        igst_amount DECIMAL(10,2) DEFAULT 0,
        total_tax DECIMAL(10,2) NOT NULL DEFAULT 0,
        shipping_charge DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        balance_amount DECIMAL(10,2) NOT NULL,
        status ENUM('DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED') 
                DEFAULT 'DRAFT',
        pdf_url VARCHAR(500),
        notes TEXT,
        created_by BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_invoice_number (invoice_number),
        INDEX idx_order (order_id),
        INDEX idx_status (status),
        INDEX idx_invoice_date (invoice_date)
    );

    -- Audit logs table
    CREATE TABLE audit_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT,
        user_email VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id BIGINT,
        old_value JSON,
        new_value JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user (user_id),
        INDEX idx_action (action),
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_created_at (created_at)
    );

    -- Order status history table
    CREATE TABLE order_status_history (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT NOT NULL,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        changed_by BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id),
        INDEX idx_order (order_id)
    );

    -- Insert default roles
    INSERT INTO roles (name, description) VALUES
        ('CUSTOMER', 'Regular customer with shopping privileges'),
        ('ADMIN', 'Administrator with full system access'),
        ('FINANCE', 'Finance team with billing and invoice access'),
        ('WAREHOUSE', 'Warehouse team with inventory management access');

    -- Insert default categories
    INSERT INTO categories (name, description, path) VALUES
        ('Electronics', 'Electronic components and devices', '/electronics'),
        ('Mechanical', 'Mechanical parts and tools', '/mechanical'),
        ('Electrical', 'Electrical components and supplies', '/electrical'),
        ('Safety', 'Safety equipment and gear', '/safety'),
        ('Tools', 'Hand and power tools', '/tools');