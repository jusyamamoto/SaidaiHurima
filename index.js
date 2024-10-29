const sqlite3 = require("sqlite3").verbose();
const queries = require("./queries");
const templates = require("./template");
const { serve } = require("@hono/node-server");
const { serveStatic } = require("@hono/node-server/serve-static");
const { Hono } = require("hono");

const db = new sqlite3.Database("database.db");

db.serialize(() => {
    db.run(queries.Product.createTable);
    db.run(queries.Users.createTable);

    db.run(queries.Users.create, 'りんご太郎', '23TI', '工学部', 'apple@example.com', '2022-08-15 00:00:00');
    db.run(queries.Users.create, 'みかん次郎', '22te', '理学部', 'mikan@example.com', '2022-08-15 00:00:01');
    db.run(queries.Users.create, 'ぶどう三郎', '24dd', '教育学部', 'budo@example.com', '2022-08-15 00:00:02');

    db.run(queries.Product.create, '離散数学', 200, '工学部', '情報工学科', 3, '2023-01-01 00:00:00');
    db.run(queries.Product.create, '確立統計', 100, '工学部', '情報工学科', 2, '2023-01-01 00:00:01');
    db.run(queries.Product.create, '線形ダイス', 50, '工学部', '情報工学科', 1, '2023-01-01 00:00:02');
});

const app = new Hono();

//topページを追加
app.get("/", async (c) => {
    const topContent = templates.TOP_VIEW();
    const response = templates.HTML(topContent); // HTML全体の構造にTOPページのコンテンツを埋め込み
    return c.html(response);
});


app.get("/product", async (c) => {
  const Product = await new Promise((resolve) => {
      db.all(queries.Product.findAll, (err, rows) => {
          resolve(rows);
      });
      
  });

  const ProductList = templates.PRODUCT_LIST_VIEW(Product);

  const response = templates.HTML(ProductList);

  return c.html(response);
});

app.get("/sell", async (c) => {
    const registerForm = templates.PRODUCT_REGISTER_FORM_VIEW();

    const response = templates.HTML(registerForm);

    return c.html(response);
});

app.post("/sell", async (c) => {
    const body = await c.req.parseBody();
    const now = new Date().toISOString();

    // メールアドレスからユーザーIDを取得
    const userID = await new Promise((resolve, reject) => {
        db.get(queries.Users.findByEmail, [body.email], (err, row) => {
            if (err) {
                reject(err); // エラーが発生した場合
            } else if (row) {
                resolve(row.id); // メールアドレスに対応するユーザーIDを返す
            } else {
                resolve(null); // メールアドレスが見つからない場合
            }
        });
    });

    if (!userID) {
        return c.text("メールアドレスが存在しません", 400); // メールが存在しない場合
    }

    // ユーザーIDを使って商品を作成
    const productID = await new Promise((resolve, reject) => {
        db.run(queries.Product.create, body.content, body.price, body.faculty, body.department, userID, now, function(err) {
            if (err) {
                reject(err); // エラーが発生した場合
            } else {
                resolve(this.lastID); // 挿入された行のIDを取得
            }
        });
    });

    // 商品詳細ページにリダイレクト
    return c.redirect(`/product/${productID}`);
});


app.get("/product/:id", async (c) => {
    const productID = c.req.param("id");
    
    const product = await new Promise((resolve) => {
        db.get(queries.Product.findById, productID, (err, row) => {
            resolve(row);
        });
    });

    if (!product) {
        return c.notFound();
    }

    const productview = templates.PRODUCT_VIEW(product);

    const response = templates.HTML(productview);

    return c.html(response);
});

app.delete("/product/:id", async (c) => {
    const productID = c.req.param("id");
    const body = await c.req.json();
    
    // 商品が存在するか確認
    const product = await new Promise((resolve) => {
        db.get(queries.Product.findById, productID, (err, row) => {
            resolve(row);
        });
    });

    if (!product) {
        return c.json({ message: "商品が存在しません" }, 404);
    }

    // メールアドレスからユーザーIDを取得
    const userID = await new Promise((resolve, reject) => {
        db.get(queries.Users.findByEmail, [body.title], (err, row) => {
            if (err) {
                reject(err); // エラーが発生した場合
            } else if (row) {
                resolve(row.id); // メールアドレスに対応するユーザーIDを返す
            } else {
                resolve(null); // メールアドレスが見つからない場合
            }
        });
    });

    if (!userID) {
        return c.json({ message: "メールアドレスが一致しません" }, 400);
    }

    //ユーザーIDが一致しないとき
    if(userID != product.user_id){
        return c.json({ message: "メールアドレスが一致しません" }, 400);
    }

    //商品を削除
    await new Promise((resolve) => {
        db.run(queries.Product.delete, productID, function(err) {
            resolve();
        });
    });

    return c.json({ message: "商品が削除されました", redirectUrl: "/product" }, 200);
});

// 検索ページの追加
app.get("/search", async (c) => {
    const searchForm = templates.SEARCH_FORM_VIEW();  // 検索フォームのHTML生成
    const response = templates.HTML(searchForm);
    return c.html(response);
});

// 検索結果ページの追加
app.get("/search/results", async (c) => { 
    const faculty = c.req.query("faculty");
    const department = c.req.query("department");

    // データベースから検索条件に合致する商品を取得
    const products = await new Promise((resolve) => {
        db.all(
            queries.Product.findByFacultyAndDepartment,
            [faculty, department],
            (err, rows) => {
                if (err) {
                    console.error("Database error:", err);
                    resolve([]);  // エラーが発生した場合は空の結果を返す
                } else {
                    resolve(rows);
                }
            }
        );
    });

    // 検索結果のHTML生成
    const searchResults = templates.SEARCH_RESULT_FORM_VIEW(products); // 検索結果をHTMLに変換
    const response = templates.HTML(searchResults);
    return c.html(response);
});


app.get("/user/register", async (c) => {
    const registerForm = templates.USER_REGISTER_FORM_VIEW();

    const response = templates.HTML(registerForm);

    return c.html(response);
});

app.post("/user/register", async (c) => {
    const body = await c.req.parseBody();
    const now = new Date().toISOString();

    const userID = await new Promise((resolve) => {
        db.run(queries.Users.create, body.name, body.studentID, body.faculty, body.email, now, function(err) {
            resolve(this.lastID);
        });
    });

    return c.redirect(`/user/${userID}`);
});

app.get("/user/:id", async (c) => {
    const userId = c.req.param("id");

    const user = await new Promise((resolve) => {
        db.get(queries.Users.findById, userId, (err, row) => {
            resolve(row);
        });
    });

    if (!user) {
        return c.notFound();
    }

    const Product = await new Promise((resolve) => {
        db.all(queries.Product.findByUserId, userId, (err, rows) => {
            resolve(rows);
        });
    });

    const userProductList = templates.USER_PRODUCT_LIST_VIEW(user, Product);

    const response = templates.HTML(userProductList);

    return c.html(response);
});

app.use("/static/*", serveStatic({ root: "./" }));

serve(app);

process.stdin.on("data", (data) => {
  if (data.toString().trim() === "q") {
    db.close();
    process.exit();
  }
});
