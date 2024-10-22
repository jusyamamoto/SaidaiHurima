const HTML = (body) => `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>これはただの文字列です</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    ${body}
</body>
</html>
`;

const PRODUCT_REGISTER_FORM_VIEW = () => `
<h1 class="title">商品出品</h1>
<form action="/sell" method="POST">
    <label for="content">商品名</label>
    <input type="text" name="content" id="content" />
    <label for="price">値段</label>
    <input type="text" name="price" id="price" />
    <label for="user_id">ユーザーID</label>
    <input type="text" name="user_id" id="user_id" />
    <button type="sell">出品</button>
</form>
`;

const PRODUCT_LIST_VIEW = (Product) => `
<h1 class="title">商品一覧</h1>
<div class="Product-list">
    ${Product
      .map((Product) => `<div class="Product">${Product.content}</div>`)
      .join("\n")}
</div>
`;

const USER_REGISTER_FORM_VIEW = () => `
<h1 class="title">ユーザー登録</h1>
<form action="/user/register" method="POST">
    <label for="name">名前</label>
    <input type="text" name="name" id="name" />
    <label for="studentID">学籍番号</label>
    <input type="text" name="studentID" id="studentID" />
    <label for="department">学部</label>
    <input type="text" name="department" id="department" />
    <label for="email">メールアドレス</label>
    <input type="email" name="email" id="email" />
    <button type="submit">登録</button>
</form>
`;

const USER_PRODUCT_LIST_VIEW = (user, Product) => `
<h1 class="title">${user.name}さんの商品一覧</h1>
<div class="Product-list">
    ${Product
      .map((Product) => `<div class="Product">${Product.content}</div>`)
      .join("\n")}
</div>
`;

module.exports = {
    HTML,
    PRODUCT_REGISTER_FORM_VIEW,
    PRODUCT_LIST_VIEW,
    USER_REGISTER_FORM_VIEW,
    USER_PRODUCT_LIST_VIEW,
};
