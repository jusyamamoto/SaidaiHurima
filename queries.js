const Product = {
    createTable: `
        CREATE TABLE IF NOT EXISTS Product (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            price INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME NOT NULL
        );
    `,
    create: `INSERT INTO Product (content, price, user_id, created_at) VALUES (?, ?, ?, ?);`,
    findAll: `SELECT * FROM Product;`,
    findById: `SELECT * FROM Product WHERE id = ?;`,
    findByUserId: `SELECT * FROM Product WHERE user_id = ?;`,
    delete: 'DELETE FROM Product WHERE id = ?;',
};

const Users = {
    createTable: `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            studentID TEXT NOT NULL,
            department TEXT NOT NULL,
            email TEXT NOT NULL,
            created_at DATETIME NOT NULL
        );
    `,
    create: `INSERT INTO users (name, studentID, department, email, created_at) VALUES (?, ?, ?, ?, ?);`,
    findAll: `SELECT * FROM users;`,
    findById: `SELECT * FROM users WHERE id = ?;`,
    findByTweetId: `SELECT * FROM users WHERE id = (SELECT user_id FROM Product WHERE id = ?);`,
};

module.exports = {
    Product,
    Users,
};
