-- TODO: Tulis query SQL kalian di sini (CREATE TABLE & INSERT) untuk inisialisasi database otomatis
-- Membuat database jika belum adaE CURRENT_TIMESTAMP,code_ciE CURRENT_TIMESTAMP,code_cibelum selesai',E CURRENT_TIMESTAMP,SCADE,DELETE SET NULL,code_ci0F3nF3nF3nF3m', 'admin'), deadline, status) VALUES anning minggu depan', '2026-01-15', 'belum selesai'), server', '2026-01-20', 'belum selesai'),026-01-12', 'belum selesai'),sudah selesai')

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#007bff',
    icon VARCHAR(50) DEFAULT 'fa-folder',
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    status ENUM('belum selesai', 'sudah selesai') DEFAULT 'belum selesai',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    category_id INT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Admin Default (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@todolist.com', '$2b$10$XqKvVz5qPQvYzXCxN7Rr8OZG6YhYzjHWB1KxMvH5v8D8w7F9tL0mK', 'admin');

-- Insert Kategori Default
INSERT INTO categories (name, color, icon, user_id) VALUES 
('Personal', '#28a745', 'fa-user', 1),
('Work', '#007bff', 'fa-briefcase', 1),
('Study', '#ffc107', 'fa-book', 1),
('Health', '#dc3545', 'fa-heartbeat', 1);

-- Insert Tasks Dummy
INSERT INTO tasks (title, description, deadline, status, priority, category_id, user_id) VALUES 
('Meeting dengan Client', 'Presentasi project Q1', '2026-01-15', 'belum selesai', 'high', 2, 1),
('Belajar Docker', 'Selesaikan modul praktikum', '2026-01-20', 'belum selesai', 'medium', 3, 1),
('Olahraga Pagi', 'Jogging 30 menit', '2026-01-10', 'sudah selesai', 'low', 4, 1);