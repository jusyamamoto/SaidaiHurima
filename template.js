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

//topページHTMLを追加
const TOP_VIEW = () => `
<h1 class="title">Saidai Hurima</h1>
<p>このサイトでは、商品を出品・購入できます。以下のリンクから利用可能な機能にアクセスしてください。</p>
<ul>
    <li><a href="/sell">商品出品</a></li>
    <li><a href="/product">商品一覧</a></li>
    <li><a href="/user/register">ユーザー登録</a></li>
</ul>
`;

//商品出品のhtmlを追加
const PRODUCT_REGISTER_FORM_VIEW = () => `
<h1 class="title">商品出品</h1>
<form action="/sell" method="POST">
    <label for="content">商品名</label>
    <input type="text" name="content" id="content" />
    <label for="price">値段</label>
    <input type="text" name="price" id="price" />
    <label for="faculty">学部</label>
    <input type="text" name="faculty" id="faculty" />
    <label for="department">学科</label>
    <input type="text" name="department" id="department" />
    <label for="email">メールアドレス</label>
    <input type="email" name="email" id="email" />
    <button type="sell">出品</button>
</form>
`;

//商品一覧のhtmlを追加
const PRODUCT_LIST_VIEW = (Product) => `
<h1 class="title">商品一覧</h1>
<div class="Product-list">
    ${Product
      .map((Product) => `<div class="Product"><a href="/product/${Product.id}">${Product.content}</div>`)
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
    <label for="faculty">学部</label>
    <input type="text" name="faculty" id="faculty" />
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

const PRODUCT_VIEW = (product) => `
<div class="container">
    <div class="picture">
        <img src="sample.png" alt="サンプル">
    </div>
    <div id="item-info">
        <p>商品名: ${product.content}</p>
        <p>学部: ${product.faculty}</p>
        <p>学科: ${product.department}</p>
        <p>値段: ${product.price}円</p>
        <p>出品日: ${product.created_at}</p>
    </div>
</div>
<div>
    <label for="email">削除するにはメールアドレスを入力してください</label>
    <input type="text" id="email" placeholder="メールアドレスを入力">
    <button id="deleteButton">削除</button>
</div>
<script>
    document.getElementById('deleteButton').addEventListener('click', async () => {
        const productId = ${product.id};
        const emailaddressInput = document.getElementById("email");
        const emailaddress = emailaddressInput.value;

        const response = await fetch(\`/product/\${productId}\`, {
            method: 'DELETE',
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: emailaddress }),
        });

        const result = await response.json();

        if (response.ok && result.redirectUrl) {
            alert(result.message); // 成功メッセージを表示
            window.location.href = result.redirectUrl;
        } else {
            alert(result.message); // エラーメッセージを表示
        }

    });
</script>
`;

module.exports = {
    HTML,
    PRODUCT_REGISTER_FORM_VIEW,
    PRODUCT_LIST_VIEW,
    USER_REGISTER_FORM_VIEW,
    USER_PRODUCT_LIST_VIEW,
    PRODUCT_VIEW,
    TOP_VIEW, // TOPページ用の関数をエクスポートに追加
};
