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

    db.run(queries.Product.create, '離散数学', 200, 3, '2023-01-01 00:00:00');
    db.run(queries.Product.create, '確立統計', 100, 2, '2023-01-01 00:00:01');
    db.run(queries.Product.create, '線形ダイス', 50, 1, '2023-01-01 00:00:02');
});

const app = new Hono();

app.get("/", async (c) => {
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

    await new Promise((resolve) => {
        db.run(queries.Product.create, body.content, body.price, body.user_id, now, function(err) {
            resolve();
        });
    });

    return c.redirect("/");
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
        db.run(queries.Users.create, body.name, body.studentID, body.department, body.email, now, function(err) {
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
