import Database from 'better-sqlite3';
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
const db = new Database('todo.db');

app.use(cors({origin:"*"}));

// todoテーブルが存在しなければ作成するSQL
const createGoodsTableQuery = db.prepare(`
CREATE TABLE IF NOT EXISTS todo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL
);
`);

// todoテーブルが存在しなければ作成
createGoodsTableQuery.run();

// `todo`テーブルから全てのデータを取得するSQL
const getGoodsListQuery = db.prepare(`
SELECT * FROM todo;
`);

app.get("/", async (c) => {
  // `todo`テーブルから全てのデータを取得
  const goods = getGoodsListQuery.all();

  return c.json(goods, 200);
});

// `todo`テーブルにデータを挿入するSQL
const insertGoodsQuery = db.prepare(`
INSERT INTO todo (name, price) VALUES (?, ?);
`);

app.post("/", async (c) => {
  // 生のリクエストボディを取得
  const rawBody = await c.req.text();
  console.log("Received body:", rawBody);

  // JSONとしてパース
  let param;
  try {
    param = JSON.parse(rawBody); // 生のボディをJSONに変換
  } catch (error) {
    console.log("typeA");
    throw new HttpException(400, { message: "Invalid JSON" });
  }

  // nameが存在するか確認
  if (!param.name) {
    console.log("typeB");
    throw new HttpException(400, { message: "Title must be provided" });
  }

  const newGoods = {
    name: param.name,
    price: param.price, // paramから取得
    // title: param.title,
    // completed: param.completed,
  };

  // リクエストに渡されたデータをDBに挿入
  insertGoodsQuery.run(newGoods.name, newGoods.price);

  return c.json({ message: "Successfully created" }, 200);
});

// 指定されたIDのtodoを取得するSQL
const getGoodsQuery = db.prepare(`
SELECT * FROM todo WHERE id = ?;
`);
// 指定されたIDのtodoのtitleとcompletedを更新するSQL
const updateGoodsQuery = db.prepare(`
UPDATE todo SET name = ?, price = ? WHERE id = ?;
`);

app.put("/:id", async (c) => {
  const param = await c.req.json();
  const id = c.req.param("id");

  if (!param.name && param.price === undefined) {
    throw new HTTPException(400, { message: "Either title or completed must be provided" });
  }

  // 指定されたIDのtodoを取得
  const todo = getGoodsQuery.get(id);
  if (!todo) {
    throw new HTTPException(400, { message: "Failed to update task title" });
  }

  if (param.name) {
    todo.name = param.name;
  }

  if (param.price) {
    todo.price = param.price;
  }
  

  // リクエストに渡されたデータをDBに更新
  updateGoodsQuery.run(todo.name, todo.price, id);

  return c.json({ message: "Task updated" }, 200);
});

// 指定されたIDのtodoを削除するSQL
const deleteGoodsQuery = db.prepare(`
DELETE FROM todo WHERE id = ?;
`);

app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  // 指定されたIDのtodoを取得
  const goods = getGoodsQuery.get(id);

  // もし指定されたIDのtodoが存在しない場合はエラーを返す
  if (!goods) {
    throw new HTTPException(400, { message: "Failed to delete task" });
  }

  // 指定されたIDのtodoを削除
  deleteGoodsQuery.run(id);

  return c.json({ message: "Task deleted" }, 200);
});

app.onError((err, c) => {
  return c.json({ message: err.message }, 400);
});

serve({
  fetch: app.fetch,
  port: 8000,
});
