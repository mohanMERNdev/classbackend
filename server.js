const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./database.sqlite');
const PORT = 5000;
const SECRET_KEY = 'your';

app.use(cors());
app.use(express.json());


const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    });
};


app.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
        `INSERT INTO Users (username, password, role) VALUES (?, ?, ?)`,
        [username, hashedPassword, role],
        function (err) {
            if (err) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            res.json({ message: 'User registered successfully' });
        }
    );
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM Users WHERE username = ?`, [username], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.user_id, role: user.role }, SECRET_KEY);
        res.json({ token, role: user.role });
    });
});

app.get('/students', authenticate, (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    db.all(`SELECT * FROM Students`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve students' });
        }
        res.json(rows);
    });
});

app.post('/students', authenticate, (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, grade } = req.body;

    db.run(
        `INSERT INTO Students (name, grade, user_id) VALUES (?, ?, ?)`,
        [name, grade, req.user.userId],
        function (err) {
            if (err) {
                return res.status(400).json({ error: 'Failed to add student' });
            }
            res.json({ message: 'Student added successfully', student_id: this.lastID });
        }
    );
});

app.get('/teachers', authenticate, (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    db.all(`SELECT * FROM Teachers`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve teachers' });
        }
        res.json(rows);
    });
});

app.post('/teachers', authenticate, (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, subject } = req.body;

    db.run(
        `INSERT INTO Teachers (name, subject, user_id) VALUES (?, ?, ?)`,
        [name, subject, req.user.userId],
        function (err) {
            if (err) {
                return res.status(400).json({ error: 'Failed to add teacher' });
            }
            res.json({ message: 'Teacher added successfully', teacher_id: this.lastID });
        }
    );
});


app.get('/students/:id', authenticate, (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const studentId = req.params.id;
    db.get(`SELECT * FROM Students WHERE student_id = ?`, [studentId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(row);
    });
});

app.put('/students/:id', authenticate, (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const studentId = req.params.id;
    const { name, grade } = req.body;

    db.run(
        `UPDATE Students SET name = ?, grade = ? WHERE student_id = ?`,
        [name, grade, studentId],
        function (err) {
            if (err || this.changes === 0) {
                return res.status(400).json({ error: 'Failed to update student' });
            }
            res.json({ message: 'Student updated successfully' });
        }
    );
});


app.delete('/students/:id', authenticate, (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const studentId = req.params.id;
    db.run(`DELETE FROM Students WHERE student_id = ?`, [studentId], function (err) {
        if (err || this.changes === 0) {
            return res.status(400).json({ error: 'Failed to delete student' });
        }
        res.json({ message: 'Student deleted successfully' });
    });
});


app.get('/teachers/:id', authenticate, (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const teacherId = req.params.id;
    db.get(`SELECT * FROM Teachers WHERE teacher_id = ?`, [teacherId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json(row);
    });
});


app.put('/teachers/:id', authenticate, (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const teacherId = req.params.id;
    const { name, subject } = req.body;

    db.run(
        `UPDATE Teachers SET name = ?, subject = ? WHERE teacher_id = ?`,
        [name, subject, teacherId],
        function (err) {
            if (err || this.changes === 0) {
                return res.status(400).json({ error: 'Failed to update teacher' });
            }
            res.json({ message: 'Teacher updated successfully' });
        }
    );
});


app.delete('/teachers/:id', authenticate, (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const teacherId = req.params.id;
    db.run(`DELETE FROM Teachers WHERE teacher_id = ?`, [teacherId], function (err) {
        if (err || this.changes === 0) {
            return res.status(400).json({ error: 'Failed to delete teacher' });
        }
        res.json({ message: 'Teacher deleted successfully' });
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
