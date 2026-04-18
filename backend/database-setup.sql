-- Create database
CREATE DATABASE IF NOT EXISTS drivesure;
USE drivesure;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  profile_picture LONGBLOB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  car_type VARCHAR(100),
  make VARCHAR(100),
  budget_min INT,
  budget_max INT,
  area VARCHAR(100),
  year_range VARCHAR(50),
  plan VARCHAR(100),
  viewing_preference VARCHAR(100),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  agent_notes TEXT,
  schedule_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  user_name VARCHAR(100),
  stars INT,
  text TEXT,
  plan VARCHAR(100),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100),
  subject VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data (optional - demo user)
INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES
('Demo', 'Customer', 'demo@customer.com', '071 000 0001', '$2a$10$...', 'customer');
