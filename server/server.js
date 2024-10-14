import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

const todoList = [
  { title: "JavaScriptを勉強する", completed: false },
  { title: "TODOアプリを自作する", completed: false },
  { title: "漫画を読み切る", completed: true },
  { title: "ゲームをクリアする", completed: false },
];

app.get("/", (c) => c.json(todoList, 200));

app.post("/", async (c) => {
  const param = await c.req.json();

  if (!param.title) {
    throw new HttpException(400, { message: "Title must be provided" });
  }

  const newTodo = {
    completed: !!param.completed,
    title: param.title,
  };

  todoList.push(newTodo);

  return c.json({ message: "Successfully created" }, 200);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
});

serve({
  fetch: app.fetch,
  port: 8000,
});
