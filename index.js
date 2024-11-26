const sqlite3 = require("sqlite3").verbose();
const queries = require("./queries");
const templates = require("./template");
const { serve } = require("@hono/node-server");
const { serveStatic } = require("@hono/node-server/serve-static");
const { Hono } = require("hono");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {csrf} = require("hono/csrf");
const { setCookie, getCookie, deleteCookie } = require("hono/cookie");
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("database.db");

db.serialize(() => {
    db.run(queries.Product.createTable);
    db.run(queries.Users.createTable);
});

const app = new Hono();

app.use(csrf());

const sessionMap = new Map();

app.get("/", async (c) => {
    
    const topContent = templates.GATE();
    const response = templates.HTMLfortoppage(topContent); // HTML全体の構造にTOPページのコンテンツを埋め込み
    return c.html(response);
});

//topページを追加
app.get("/top-page", async (c) => {
    const topContent = templates.TOP_VIEW();
    const response = templates.HTMLfortoppage(topContent); // HTML全体の構造にTOPページのコンテンツを埋め込み
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

app.post("/sell",async (c) => {
    // リクエストのFormDataを取得
  const formData = await c.req.formData();
  const file = formData.get("imagePath");

  if (!file) {
    return c.json({ message: "ファイルがアップロードされていません" }, 400);
  }

  // ファイルパスと保存先ディレクトリの設定
  const uploadDir = path.join(__dirname, "img");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const filePath = path.join(uploadDir, uniqueSuffix + path.extname(file.name));

  // ファイルを保存
  const buffer = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));

  const body = await c.req.parseBody();
  const now = new Date().toISOString();
  const imagePath = `../img/${uniqueSuffix + path.extname(file.name)}`;

  // ユーザーIDの取得と商品登録の処理はそのまま
  const userID = await new Promise((resolve, reject) => {
    db.get(queries.Users.findByEmail, [body.email], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        resolve(row.id);
      } else {
        resolve(null);
      }
    });
  });

  if (!userID) {
    return c.json({ message: "メールアドレスが一致しません" }, 400);
  }

  const productID = await new Promise((resolve, reject) => {
    db.run(
      queries.Product.create,
      [body.content, body.price, body.faculty, body.department, userID, now, imagePath],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });

  return c.json({ message: "商品が出品されました", productID, redirectUrl: `/product/${productID}` }, 200);
});





app.get("/product/:id", async (c) => {
    const productID = c.req.param("id");

    
    const user = await new Promise((resolve) => {
        db.get(queries.Product.findUserNameByProductId, productID, (err, row) => {
            resolve(row);
        });
    });

    const product = await new Promise((resolve) => {
        db.get(queries.Product.findById, productID, (err, row) => {
            resolve(row);
        });
    });

    if (!product) {
        return c.notFound();
    }

    const productview = templates.PRODUCT_VIEW(user , product);

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

    return c.json({ message: "商品が削除されました", redirectUrl: "/mypage" }, 200);
});

//商品情報変更のページ
app.get("/product/:id/change", async (c) => {
    const userId = c.req.param("id");
    const productID = c.req.param("id");

    const user = await new Promise((resolve) => {
        db.get(queries.Users.findById, userId, (err, row) => {
            resolve(row);
        });
    });

    const product = await new Promise((resolve) => {
        db.get(queries.Product.findById, productID, (err, row) => {
            resolve(row);
        });
    });

    if (!user) {
        return c.notFound();
    }

    if (!product) {
        return c.notFound();
    }

    // PRODUCT_CHANGE_FORM_VIEWを呼び出す
    const productChangeForm = templates.PRODUCT_CHANGE_FORM_VIEW(user, product);

    const response = templates.HTML(productChangeForm);

    return c.html(response);
});

// 商品情報の変更
app.post("/product/:id/change", async (c) => {
    const productId = c.req.param("id");
    const body = await c.req.parseBody();

    // メールアドレスからユーザーIDを取得
    const userID = await new Promise((resolve, reject) => {
        db.get(queries.Users.findByEmail, [body.email], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                resolve(row.id);
            } else {
                resolve(null);
            }
        });
    });

    if (!userID) {
        return c.json({ message: "メールアドレスが一致しません" }, 400);
    }

    await new Promise((resolve, reject) => {
        db.run(queries.Product.update, [body.content, body.price, body.faculty, body.department, userID, productId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    return c.redirect(`/product/${productId}`);
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
    const body = await c.req.json();
    const now = new Date().toISOString();
    if(!body.name||!body.studentID||!body.faculty||!body.email||!body.password){
        return c.json({ message: "入力されていない欄があります" }, 400);
    }
    try{
        const hashedPassword = await bcrypt.hash(body.password, 10); //パスワードをハッシュ化
        const stmt = db.prepare(queries.Users.create);
        const createdUserId = await new Promise((resolve, reject) => {
            stmt.run([body.name, body.studentID, body.faculty, body.email, hashedPassword, now], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
        const sessionID = Math.random().toString(36).slice(-8); // セッションIDを生成
        sessionMap.set(sessionID, createdUserId); // セッションIDとユーザIDを紐付ける
        setCookie(c, "sessionID", sessionID, {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1週間後に削除
            httpOnly: true, // クライアント側からアクセスできないようにする
            SameSite: "Strict", // クロスサイトリクエストを防ぐ
        });
        return c.json({ message: "", redirectUrl: "/mypage" }, 200);
    } catch (err) {
        return c.json({ message: "既に登録されているメールアドレスです" }, 400);
    }
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

app.delete("/user/:id", async (c) => {
    const productID = c.req.param("id");
    const body = await c.req.json();
    
    // 商品が存在するか確認
    const user = await new Promise((resolve) => {
        db.get(queries.Users.findById, productID, (err, row) => {
            resolve(row);
        });
    });

    if (!user) {
        return c.json({ message: "アカウントが存在しません" }, 404);
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
    if(userID != user.id){
        return c.json({ message: "メールアドレスが一致しません" }, 400);
    }

    //ユーザーの商品を全て削除
    await new Promise((resolve) => {
        db.run(queries.Product.deleteByUserId, userID, function(err) {
            resolve();
        });
    });

    //アカウントを消去
    await new Promise((resolve) => {
        db.run(queries.Users.delete, userID, function(err) {
            resolve();
        });
    });

    return c.json({ message: "アカウントが削除されました", redirectUrl: "/" }, 200);
});


app.get("/user/:id/change", async (c) => {
    const userId = c.req.param("id");

    const user = await new Promise((resolve) => {
        db.get(queries.Users.findById, userId, (err, row) => {
            resolve(row);
        });
    });

    if (!user) {
        return c.notFound();
    }

    const userChangeView = templates.USER_CHANGE_VIEW(user);
    const response = templates.HTML(userChangeView);

    return c.html(response);
});

// ユーザー情報変更を処理するエンドポイント
app.post("/user/:id/change", async (c) => {
    const userId = c.req.param("id");
    const body = await c.req.parseBody();

    await new Promise((resolve) => {
        db.run(queries.Users.update, body.name, body.studentID, body.faculty, body.email, userId, function(err) {
            resolve();
        });
    });

    return c.redirect(`/user/${userId}`);
});

// ユーザーの商品一覧を表示するエンドポイント
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

app.get("/login", async(c) => {

    const sessionID = getCookie(c, "sessionID");
    const userID = sessionMap.get(sessionID);

    if (userID) {
        return c.redirect(`/top-page`)
    } else {
        const loginView = templates.LOGIN_VIEW();
        const response = templates.HTML(loginView);
        return c.html(response);    
    }
});

app.post("/login", async(c) => {

    const body = await c.req.json();

    if (!body.email || !body.password) {
    return c.json({ message: "メールアドレスまたはパスワードが未入力です" }, 400);
    }
    try {
    const user = await new Promise((resolve, reject) => {
        db.get(queries.Users.findByEmail, [body.email], (err, row) => {
        if (err) {
            reject(err);
        } else {
            resolve(row);
        }
        });
    });
    if (!user) {
        return c.json({ message: "メールアドレスまたはパスワードが間違っています" }, 400);
    }

    const isValidPassword = await bcrypt.compare(body.password, user.hashed_password);
    if (!isValidPassword) {
        return c.json({ message: "メールアドレスまたはパスワードが間違っています" }, 400);
    }

    const sessionID = Math.random().toString(36).slice(-8);
    sessionMap.set(sessionID, user.id);
    setCookie(c, "sessionID", sessionID, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        httpOnly: true,
        SameSite: "Strict",
    });
    return c.json({ message: "", redirectUrl: "/top-page" }, 200);
    } catch (err) {
    return c.json({ message: "エラー" }, 400);
    }

});

app.get("/logout", (c) => {
    const sessionID = getCookie(c, "sessionID");
    sessionMap.delete(sessionID); // セッションIDを削除
    deleteCookie(c, "sessionID"); // クッキーを削除
    return c.redirect("/");
});

app.get("/mypage", async(c) => {
    //ログインしているか判断するための処理を含む
    const sessionID = getCookie(c, "sessionID");
    const userID = sessionMap.get(sessionID);

    if (userID) {
        try{
        // ログインしている場合、マイページに移動
        const user = await new Promise((resolve, reject) => {
            db.get(queries.Users.findById, [userID], (err, row) => {
              if (err) {
                console.error("データベース取得エラー:", err);
                reject(err);
              } else {
                resolve(row);
              }
            })
        })

        const product = await new Promise((resolve) => {
            db.all(queries.Product.findByUserId, user.id, (err, rows) => {
                resolve(rows);
            });
        });


        console.log("取得したユーザー情報:", user);
        const mypageView = templates.MYPAGE_VIEW(user,product);
        const response = templates.HTML(mypageView);
        return c.html(response);
        }catch(err){
            console.error("データベースエラー:", err);
            return c.json({ message: "データベースエラーが発生しました。" }, 500);
        }
    } else {
        // ログインしていない場合、ログインページへリダイレクト 
        return c.redirect(`/login`);        
    }
});


app.use("/static/*", serveStatic({ root: "./" }));

app.use("/img/*", serveStatic({ root: "./" }));

serve(app);

process.stdin.on("data", (data) => {
  if (data.toString().trim() === "q") {
    db.close();
    process.exit();
  }
});
