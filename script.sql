
CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher'))
);

CREATE TABLE IF NOT EXISTS Students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    grade TEXT,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Teachers (
    teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subject TEXT,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

INSERT INTO Users (username, password, role) VALUES 
('teacher1', '$2b$10$8vhI0iK9Mgtd6y/TN.FQ7u6fPjORPC9y.dL1GqZTwE9Pp1/e7vB2G', 'teacher'), 
('student1', '$2b$10$8vhI0iK9Mgtd6y/TN.FQ7u6fPjORPC9y.dL1GqZTwE9Pp1/e7vB2G', 'student'),   
('teacher2', '$2b$10$8vhI0iK9Mgtd6y/TN.FQ7u6fPjORPC9y.dL1GqZTwE9Pp1/e7vB2G', 'teacher'),  
('student2', '$2b$10$8vhI0iK9Mgtd6y/TN.FQ7u6fPjORPC9y.dL1GqZTwE9Pp1/e7vB2G', 'student');  


INSERT INTO Students (name, grade, user_id) VALUES
('John Doe', 'A', 2),
('Jane Smith', 'B+', 4);

INSERT INTO Teachers (name, subject, user_id) VALUES
('Mr. Anderson', 'Mathematics', 1),
('Ms. Johnson', 'Physics', 3);
