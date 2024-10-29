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

//検索を追加
const TOP_VIEW = () => `
<h1 class="title">Saidai Hurima</h1>
<p>このサイトでは、商品を出品・購入できます。以下のリンクから利用可能な機能にアクセスしてください。</p>
<ul>
    <li><a href="/sell">商品出品</a></li>
    <li><a href="/product">商品一覧</a></li>
    <li><a href="/user/register">ユーザー登録</a></li>
    <li><a href="/search">検索</a></li>  
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

// 検索フォーム
const SEARCH_FORM_VIEW = () => `
<h1 class="title">検索</h1>
<form action="/search/results" method="GET">
    <label for="faculty">学部</label>
    <select name="faculty" id="faculty">
        <option value="工学部">工学部</option>
        <option value="理学部">理学部</option>
    </select>

    <label for="department">学科</label>
    <select name="department" id="department">
        <option value="機械工学科">機械工学科</option>
        <option value="情報工学科">情報工学科</option>
        <option value="環境社会学科">環境社会学科</option>
        <option value="数学科">数学科</option>
        <option value="物理科">物理科</option>
    </select>

    <button type="submit">検索</button>
</form>
`;

// 検索結果
const SEARCH_RESULT_FORM_VIEW = (products) => `
<h1 class="title">検索結果</h1>
<div class="Product-list">
    ${
        products.length > 0 
            ? products.map(product => `
                <div class="Product">
                    <a href="/product/${product.id}">${product.content}</a>
                    <p>価格: ${product.price} 円</p>
                </div>
            `).join("\n")
            : '<p>該当する商品が見つかりませんでした。</p>'
    }
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

<button id="deleteButton">削除</button>
<script>
    document.getElementById('deleteButton').addEventListener('click', async () => {
        const productId = ${product.id};

        const response = await fetch(\`/product/\${productId}\`, {
            method: 'DELETE',
        });

        if (response.redirected) {
            window.location.href = response.url; // リダイレクトを処理
        } else {
            const result = await response.text();
            console.log(result); // エラーメッセージや成功メッセージを表示
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
    TOP_VIEW, 
    SEARCH_FORM_VIEW,//検索ページの追加
    SEARCH_RESULT_FORM_VIEW // 検索結果ページの追加
};
