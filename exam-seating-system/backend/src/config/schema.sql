CREATE DATABASE IF NOT EXISTS exam_seating_db;
USE exam_seating_db;

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS halls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  building VARCHAR(100),
  floor_number INT DEFAULT 1,
  num_rows INT NOT NULL,
  num_cols INT NOT NULL,
  capacity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  department_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  roll_number VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL DEFAULT '123456',
  department_id INT,
  semester INT,
  section VARCHAR(10),
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_name VARCHAR(200) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  department_id INT,
  semester INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS seating_arrangements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  hall_id INT NOT NULL,
  student_id INT NOT NULL,
  seat_row INT NOT NULL,
  seat_col INT NOT NULL,
  seat_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY unique_seat (exam_id, hall_id, seat_row, seat_col),
  UNIQUE KEY unique_student_exam (exam_id, student_id)
);

INSERT INTO departments (name, code) VALUES
('Computer Science', 'CSE'),
('Electronics', 'ECE'),
('Mechanical', 'MECH'),
('Civil', 'CIVIL'),
('Information Technology', 'IT');

INSERT INTO halls (name, building, floor_number, num_rows, num_cols, capacity) VALUES
('Hall A', 'Main Block', 1, 5, 6, 30),
('Hall B', 'Main Block', 2, 6, 7, 42),
('Hall C', 'Science Block', 1, 4, 5, 20),
('Hall D', 'Science Block', 2, 7, 8, 56);

INSERT INTO admins (name, username, password, email) VALUES
('Super Admin', 'admin', 'admin123', 'admin@examhall.com');

INSERT INTO staff (name, username, password, email, department_id) VALUES
('Dr. Rajesh Kumar', 'staff', 'staff123', 'rajesh@examhall.com', 1),
('Prof. Priya Sharma', 'staff2', 'staff123', 'priya@examhall.com', 2);

INSERT INTO students (name, roll_number, password, department_id, semester, section, email) VALUES
('Arun Kumar', 'student', 'student123', 1, 5, 'A', 'arun@student.com'),
('Priya Devi', 'CSE2021002', 'student123', 1, 5, 'A', 'priya@student.com'),
('Ravi Shankar', 'ECE2021001', 'student123', 2, 5, 'B', 'ravi@student.com');
