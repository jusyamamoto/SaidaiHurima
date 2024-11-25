const { html } = require("hono/html");

const HTML = (body) => html`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>埼大フリマ</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/static/style.css">
</head>
<header>
    <a href = "/top-page">埼大フリマ</a>
</header>
<body>
    ${body}
</body>
</html>
`;

const HTMLfortoppage = (body) => html`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>埼大フリマ</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    ${body}
</body>
</html>
`;

const GATE = () => html`
<link rel="stylesheet" href="static/top-page.css">
<div class="main_title">
    <h1 class="title1">埼大フリマ</h1>
    <p class="sub_title">このサイトでは、商品を出品・購入できます。<br>はじめましての方はユーザー登録を行ってください。<br>ユーザー登録済みの方はログインをお願いします。</p>
</div>
<div class="button-container">
    <a href="/login" class="button">ログイン</a>
    <a href="/user/register" class="button">ユーザー登録</a>
</div>
`;


//検索を追加
const TOP_VIEW = () => html`
<link rel="stylesheet" href="static/top-page.css">
<div class="main_title">
    <h1 class="title1">埼大フリマ</h1>
    <p class="sub_title">このサイトでは、商品を出品・購入できます。<br>以下のリンクから利用可能な機能にアクセスしてください。</p>
</div>
<div class="button-container">
    <a href="/sell" class="button">商品出品</a>
    <a href="/product" class="button">商品一覧</a>
    <a href="/search" class="button">検索</a>
    <a href="/mypage" class="button">マイページ</a>
</div>
`;

const PRODUCT_REGISTER_FORM_VIEW = () => html`
<h1 class="title">商品出品</h1>
<div id="message"></div> <!-- メッセージ表示用のエリア -->
<form action="/sell" method="POST" id="productForm" enctype="multipart/form-data">
    <label for="content">商品名</label>
    <input type="text" name="content" id="content" required />
    <label for="price">値段</label>
    <input type="text" name="price" id="price" required />
    
    <label for="faculty">学部</label>
    <select name="faculty" id="faculty" required>
        <option value="工学部">工学部</option>
        <option value="理学部">理学部</option>
    </select>

    <label for="department">学科</label>
    <select name="department" id="department" required>
        <option value="機械工学科">機械工学科</option>
        <option value="情報工学科">情報工学科</option>
        <option value="環境社会学科">環境社会学科</option>
        <option value="数学科">数学科</option>
        <option value="物理科">物理科</option>
    </select>

    <label for="email">メールアドレス</label>
    <input type="email" name="email" id="email" required />
    <input type="file" name="imagePath" id ="imagePath" accept="image/*">
    <button type="submit">出品</button>
</form>

<script>
    document.getElementById('productForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // デフォルトのフォーム送信を防止

        const formData = new FormData(this);
        
        const response = await fetch('/sell', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        const messageDiv = document.getElementById('message');
        
        if (response.ok) {
            messageDiv.innerText = result.message; // 成功メッセージを表示
            messageDiv.style.color = 'green';
            if (result.redirectUrl) {
                setTimeout(() => window.location.href = result.redirectUrl, 1000); // リダイレクト
            }
        } else {
            messageDiv.innerText = result.message; // エラーメッセージを表示
            messageDiv.style.color = 'red';
        }
    });
</script>
`;


//商品一覧のhtmlを追加
const PRODUCT_LIST_VIEW = (Product) => html`
<h1 class="title">商品一覧</h1>
<div class="Product-list">
    ${Product.map((Product) => html`
      <div class="Product">
        <a href="/product/${Product.id}">${Product.content}</a>
      </div>`)}
</div>
`;

// 検索フォーム
const SEARCH_FORM_VIEW = () => html`
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
const SEARCH_RESULT_FORM_VIEW = (products) => html`
<h1 class="title">検索結果</h1>
<div class="Product-list">
    ${
        products.length > 0 
            ? products.map(product => html`
                <div class="Product">
                    <a href="/product/${product.id}">${product.content}</a>
                    <p>価格: ${product.price} 円</p>
                </div>
            `)
            : html`<p>該当する商品が見つかりませんでした。</p>`
    }
</div>
`;


const USER_REGISTER_FORM_VIEW = () => html`
<h1 class="title">ユーザー登録</h1>
    <div id="message"></div> <!-- メッセージ表示用のエリア -->
    <label for="name">名前</label>
    <input type="text" name="name" id="name" required />
    <label for="studentID">学籍番号</label>
    <input type="text" name="studentID" id="studentID" required />
    <label for="faculty">学部</label>
    <input type="text" name="faculty" id="faculty" required />
    <label for="email">メールアドレス</label>
    <input type="email" name="email" id="email" required />
    <label for="password">パスワード</label>
    <input type="text" name="password" id="password" required />
    <button type="button" id="submit">登録</button>

<script>
    document.getElementById('submit').addEventListener('click', async () => {
        const usernameInput = document.getElementById("name");
        const username = usernameInput.value;
        const useridInput = document.getElementById("studentID");
        const userid = useridInput.value;
        const userfacultyInput = document.getElementById("faculty");
        const userfaculty = userfacultyInput.value;
        const emailaddressInput = document.getElementById("email");
        const emailaddress = emailaddressInput.value.trim();
        const passwordInput = document.getElementById("password");
        const pass = passwordInput.value.trim();

        const response = await fetch('/user/register', {
            method: 'POST',
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: username,
                studentID: userid,
                faculty: userfaculty,  
                email: emailaddress, 
                password: pass 
            }),
        });

        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (response.ok && result.redirectUrl) {
            window.location.href = result.redirectUrl; // リダイレクト
        } else {
            messageDiv.innerText = result.message; // エラーメッセージを表示
            messageDiv.style.color = 'red';
        }

    });
</script>
`;

const USER_PRODUCT_LIST_VIEW = (user, Product) => html`
<h1 class="title">${user.name}さんの商品一覧</h1>
<button id="put" type="button" onclick="location.href='/user/${user.id}/change'">ユーザー情報の変更</button>
<div class="Product-list">
    ${Product
      .map((Product) => `<div class="Product">${Product.content}</div>`)
      }
</div>
<div>
    <label for="email">アカウントを削除するにはメールアドレスを入力してください</label>
    <div id="message"></div> <!-- メッセージ表示用のエリア -->
    <input type="text" id="email" placeholder="メールアドレスを入力">
    <button id="deleteButton">削除</button>
</div>
<script>
    document.getElementById('deleteButton').addEventListener('click', async () => {
        const userId = ${user.id};
        const emailaddressInput = document.getElementById("email");
        const emailaddress = emailaddressInput.value;

        const response = await fetch(\`/user/\${userId}\`, {
            method: 'DELETE',
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: emailaddress }),
        });

        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (response.ok && result.redirectUrl) {
            messageDiv.innerText = result.message; // 成功メッセージを表示
            messageDiv.style.color = 'green';
            if (result.redirectUrl) {
                setTimeout(() => window.location.href = result.redirectUrl, 1000); // リダイレクト
            }
        } else {
            messageDiv.innerText = result.message; // エラーメッセージを表示
        }

    });
</script>
`;


//ユーザー情報の変更ページ
const USER_CHANGE_VIEW = (user) => html`
<h1 class="title">${user.name}さんのユーザー情報変更</h1>
<form action="/user/${user.id}/change" method="POST">
    <label for="name">${user.name}</label>
    <input type="text" name="name" id="name" /><br />
    <label for="studentID">${user.studentID}</label>
    <input type="text" name="studentID" id="studentID" /><br />
    <label for="faculty">${user.faculty}</label>
    <input type="text" name="faculty" id="faculty" /><br />
    <label for="email">${user.email}</label>
    <input type="text" name="email" id="email" /><br />
    <button type="submit">登録</button>
</form>
`;


//商品情報
const PRODUCT_VIEW = (user, product)=> html`
<link rel="stylesheet" href="/static/product-info.css">
<div class="container">
  <div class="picture">
    <img src="${product.imagePath}" alt="サンプル">
  </div>
  <div class="product-info">
  <h1>${product.content}</h1>
  <table>
    <tr>
      <th>価格：${product.price}円</th>
    </tr>
    <tr>
      <th>学部：${product.department}</th>
    </tr>
    <tr>
      <th>学科：${product.faculty}</th>
    </tr>
    <tr>
      <th>出品者：${user.name}</th>
    </tr>
    <tr>
      <th>出品日：${product.created_at}</th>
    </tr>
  </table>
</div>
</div>
<!--デザインの関係でコメントアウト中・・・中村
    <label for="email">削除するにはメールアドレスを入力してください</label>
    <div id="message"></div> メッセージ表示用のエリア
    <input type="email" id="email" placeholder="メールアドレスを入力">
    <button id="deleteButton">削除</button>
    <button  type="button" onclick="location.href='/product/${product.id}/change'">商品情報の変更</button>
-->

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
        const messageDiv = document.getElementById('message');

        if (response.ok && result.redirectUrl) {
            messageDiv.innerText = result.message; // 成功メッセージを表示
            messageDiv.style.color = 'green';
            if (result.redirectUrl) {
                setTimeout(() => window.location.href = result.redirectUrl, 1000); // リダイレクト
            }
        } else {
            messageDiv.innerText = result.message; // エラーメッセージを表示
            messageDiv.style.color = 'red';
        }

    });
</script>
`;

//商品情報の変更
const PRODUCT_CHANGE_FORM_VIEW = (user, product) => html`
<h1 class="title">商品情報変更</h1>
<div id="message"></div> <!-- メッセージ表示用のエリア -->
<form action="/product/${product.id}/change" method="POST" id="productForm">
    <label for="content">商品名</label>
    <input type="text" name="content" id="content" value="${product.content}" required />
    
    <label for="price">値段</label>
    <input type="text" name="price" id="price" value="${product.price}" required />
    
    <label for="faculty">学部</label>
    <select name="faculty" id="faculty" required>
        <option value="工学部" ${product.faculty === '工学部' ? 'selected' : ''}>工学部</option>
        <option value="理学部" ${product.faculty === '理学部' ? 'selected' : ''}>理学部</option>
    </select>

    <label for="department">学科</label>
    <select name="department" id="department" required>
        <option value="機械工学科" ${product.department === '機械工学科' ? 'selected' : ''}>機械工学科</option>
        <option value="情報工学科" ${product.department === '情報工学科' ? 'selected' : ''}>情報工学科</option>
        <option value="環境社会学科" ${product.department === '環境社会学科' ? 'selected' : ''}>環境社会学科</option>
        <option value="数学科" ${product.department === '数学科' ? 'selected' : ''}>数学科</option>
        <option value="物理科" ${product.department === '物理科' ? 'selected' : ''}>物理科</option>
    </select>

    <label for="email">メールアドレス</label>
    <input type="email" name="email" id="email" value="${user.email}" required />
    
    <button type="submit">変更</button>
</form>
`;

const LOGIN_VIEW = () => html`
<h1>ログイン</h1>
<div>
    <div id="message"></div> <!-- メッセージ表示用のエリア -->
    <input type="text" id="email" placeholder="メールアドレス" required />
    <input type="text" id="password" placeholder="パスワード"  required />
    <button id="login", type="button">ログイン</button>
</div>
<script>
    document.getElementById('login').addEventListener('click', async () => {
        const emailaddressInput = document.getElementById("email");
        const emailaddress = emailaddressInput.value.trim();
        const passwordInput = document.getElementById("password");
        const pass = passwordInput.value.trim();

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                email: emailaddress, 
                password: pass 
            }),
        });

        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (response.ok && result.redirectUrl) {
            window.location.href = result.redirectUrl; // リダイレクト
        } else {
            messageDiv.innerText = result.message; // エラーメッセージを表示
            messageDiv.style.color = 'red';
        }

    });
</script>

`;
const MYPAGE_VIEW = (user) => html`
<h1>${user.name}さんのマイページ</h1>
<a href="/logout">ログアウト</a>
`;


module.exports = {
    HTML,
    GATE,
    HTMLfortoppage,
    PRODUCT_REGISTER_FORM_VIEW,
    PRODUCT_CHANGE_FORM_VIEW,
    PRODUCT_LIST_VIEW,
    USER_REGISTER_FORM_VIEW,
    USER_PRODUCT_LIST_VIEW,
    USER_CHANGE_VIEW,
    PRODUCT_VIEW,
    TOP_VIEW, 
    SEARCH_FORM_VIEW,//検索ページの追加
    SEARCH_RESULT_FORM_VIEW, // 検索結果ページの追加
    LOGIN_VIEW,
    MYPAGE_VIEW
};
