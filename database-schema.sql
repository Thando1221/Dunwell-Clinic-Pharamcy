-- Pharmacy Management System Database Schema
-- For SQL Server (Azure SQL Database)

-- Create database (if not exists)
-- CREATE DATABASE Dunwell_Clinic;
-- USE Dunwell_Clinic;

-- Categories table
CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Medicines table
CREATE TABLE medicines (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 10,
    expiry_date DATE NOT NULL,
    batch_number NVARCHAR(100) NOT NULL,
    supplier NVARCHAR(255) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Medicine transactions table (for tracking dispensing)
CREATE TABLE medicine_transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_id INT NOT NULL,
    transaction_type NVARCHAR(20) NOT NULL CHECK (transaction_type IN ('DISPENSE', 'RESTOCK', 'ADJUSTMENT')),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    patient_name NVARCHAR(255),
    prescription_number NVARCHAR(100),
    dispensed_by NVARCHAR(255),
    notes NVARCHAR(500),
    transaction_date DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

-- Users table (for authentication)
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    role NCHAR(1) NOT NULL CHECK (role IN ('P', 'S')) DEFAULT 'S', -- P=Pharmacist/Admin, S=Staff
    email NVARCHAR(255),
    phone NVARCHAR(20),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES 
('Antibiotics', 'Antimicrobial medications'),
('Analgesics', 'Pain relief medications'),
('Antacids', 'Stomach acid neutralizers'),
('Vitamins', 'Vitamin supplements'),
('Antiseptics', 'Wound cleaning solutions');

-- Insert default admin user (password: admin123 - change in production!)
INSERT INTO users (username, password_hash, full_name, role, email) VALUES 
('admin', '$2b$10$rQJ5f7qP8qZ9f7qP8qZ9f7qP8qZ9f7qP8qZ9f7qP8qZ9f7qP8qZ9f', 'System Administrator', 'P', 'admin@dunwell.com');

-- Create indexes for better performance
CREATE INDEX idx_medicines_category ON medicines(category_id);
CREATE INDEX idx_medicines_expiry ON medicines(expiry_date);
CREATE INDEX idx_medicines_stock ON medicines(stock);
CREATE INDEX idx_transactions_medicine ON medicine_transactions(medicine_id);
CREATE INDEX idx_transactions_date ON medicine_transactions(transaction_date);
CREATE INDEX idx_transactions_type ON medicine_transactions(transaction_type);