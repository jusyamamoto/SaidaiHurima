const Product = {
    createTable: `
        CREATE TABLE IF NOT EXISTS Product (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            price INTEGER NOT NULL,
            faculty TEXT NOT NULL,
            department TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME NOT NULL,
            imagePath TEXT NOT NULL
        );
    `,
    create: `INSERT INTO Product (content, price, faculty, department, user_id, created_at, imagePath) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    findAll: `SELECT * FROM Product;`,
    findById: `SELECT * FROM Product WHERE id = ?;`,
    findByUserId: `SELECT * FROM Product WHERE user_id = ?;`,
    delete: 'DELETE FROM Product WHERE id = ?;',
    findByFacultyAndDepartment: `SELECT * FROM Product WHERE faculty = ? AND department = ?;`,// 学部と学科で検索するクエリを追加
    findUserByProductId: `SELECT * FROM Users u JOIN Product p ON u.id = p.user_id WHERE p.id = ?;`, // プロダクトIDからユーザーの情報すべてを取得に変更
    deleteByUserId: `DELETE FROM Product WHERE user_id = ?;`, //特定のユーザーの商品を全消去
    update: `UPDATE Product SET content = ?, price = ?, faculty = ?, department = ? WHERE id = ?;`,
};

const Users = {
    createTable: `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            studentID TEXT NOT NULL,
            faculty TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL,
            created_at DATETIME NOT NULL
        );
    `,
    create: `INSERT INTO users (name, studentID, faculty, email, hashed_password, created_at) VALUES (?, ?, ?, ?, ?, ?);`,
    findAll: `SELECT * FROM users;`,
    findById: `SELECT * FROM users WHERE id = ?;`,
    findByTweetId: `SELECT * FROM users WHERE id = (SELECT user_id FROM Product WHERE id = ?);`,
    findByEmail: `SELECT * FROM users WHERE email = ?;`,
    delete: `DELETE FROM users WHERE id = ?;`,
    update: `UPDATE users SET name = ?, studentID = ?, faculty = ?, email = ? WHERE id = ?;`,
};

module.exports = {
    Product,
    Users,
};
