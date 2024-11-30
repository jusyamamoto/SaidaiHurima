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
<header>
    <p>埼大フリマ</p>
</header>
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
<form action="/sell" method="POST" id="productForm" class="form-group" enctype="multipart/form-data">
    <label for="content">商品名</label>
    <input type="text" name="content" id="content" placeholder="商品名" required />
    <label for="price">値段</label>
    <input type="text" name="price" id="price" placeholder="値段" required />
    
    <label for="faculty">学部</label>
    <select name="faculty" id="faculty" required>
        <option value="工学部">工学部</option>
        <option value="理学部">理学部</option>
    </select>

    <label for="department">学科</label>
    <select name="department" id="department" required>
        <option value="機械工学・システムデザイン学科">機械工学・システムデザイン学科</option>
        <option value="電気電子物理工学科">電気電子物理工学科</option>
        <option value="情報工学科">情報工学科</option>
        <option value="応用化学科">応用化学科</option>
        <option value="環境社会デザイン学科">環境社会デザイン学科</option>
        <option value="数学科">数学科</option>
        <option value="物理学科">物理学科</option>
        <option value="基礎化学科">基礎化学科</option>
        <option value="分子生物学科">分子生物学科</option>
        <option value="生体制御学科">生体制御学科</option>
    </select>

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
        <p>価格: ${Product.price} 円</p>
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
        <option value="機械工学・システムデザイン学科">機械工学・システムデザイン学科</option>
        <option value="電気電子物理工学科">電気電子物理工学科</option>
        <option value="情報工学科">情報工学科</option>
        <option value="環境社会デザイン学科">環境社会デザイン学科</option>
        <option value="数学科">数学科</option>
        <option value="物理学科">物理学科</option>
        <option value="基礎化学科">基礎化学科</option>
        <option value="分子生物学科">分子生物学科</option>
        <option value="生体制御学科">生体制御学科</option>
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
<div class="form-container">
    <div id="message" class="message-area"></div> <!-- メッセージ表示用のエリア -->
    <form id="user-register" class="form-group">

        <label for="name">名前</label>
        <input type="text" name="name" id="name" placeholder="名前"required />

        <label for="studentID">学籍番号</label>
        <input type="text" name="studentID" id="studentID" placeholder="学籍番号"required />

        <label for="faculty">学部</label>
        <select name="faculty" id="faculty" required>
            <option value="工学部">工学部</option>
            <option value="理学部">理学部</option>
        </select>

        <label for="email">メールアドレス</label>
        <input type="email" name="email" id="email" placeholder="メールアドレス 例:Justice@yamamoto.com" required />

        <label for="password">パスワード</label>
        <input type="password" name="password" id="password" placeholder="パスワード" required />

        <button type="submit" id="submit">登録</button>
    </form>
</div>
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

//ユーザー情報の変更ページ
const USER_CHANGE_VIEW = (user) => html`
<h1 class="title">${user.name}さんのユーザー情報変更</h1>
<form action="/user/${user.id}/change" method="POST">
    <label for="name">名前</label>
    <input type="text" name="name" id="name" value="${user.name}" required/><br />
    <label for="studentID">学籍番号</label>
    <input type="text" name="studentID" id="studentID" value="${user.studentID}" required/><br />
    <label for="faculty">学部</label>
    <select name="faculty" id="faculty" required>
        <option value="工学部" ${user.faculty === '工学部' ? 'selected' : ''}>工学部</option>
        <option value="理学部" ${user.faculty === '理学部' ? 'selected' : ''}>理学部</option>
    </select>
    <label for="email">メールアドレス</label>
    <input type="text" name="email" id="email" value="${user.email}" required/><br />
    <button type="submit">変更</button>
</form>
`;

//商品情報
const PRODUCT_VIEW = (user, product)=> html`
<link rel="stylesheet" href="/static/product.css">
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
<div class = "button-place">
    <button type="button" onclick="matchingbutton('${user.email}')">フリマする</button>
</div>
<script>
    function matchingbutton(email){
        alert("出品者のメールアドレスは"+email+"です");
    }
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
        <option value="機械工学・システムデザイン学科" ${product.department === '機械工学・システムデザイン学科' ? 'selected' : ''}>機械工学・システムデザイン学科</option>
        <option value="電気電子物理工学科" ${product.department === '電気電子物理工学科' ? 'selected' : ''}>電気電子物理工学科</option>
        <option value="情報工学科" ${product.department === '情報工学科' ? 'selected' : ''}>情報工学科</option>
        <option value="応用化学科" ${product.department === '応用化学科' ? 'selected' : ''}>応用化学科</option>
        <option value="環境社会デザイン学科" ${product.department === '環境社会デザイン学科' ? 'selected' : ''}>環境社会デザイン学科</option>
        <option value="数学科" ${product.department === '数学科' ? 'selected' : ''}>数学科</option>
        <option value="物理学科" ${product.department === '物理学科' ? 'selected' : ''}>物理学科</option>
        <option value="基礎化学科" ${product.department === '基礎化学科' ? 'selected' : ''}>基礎化学科</option>
        <option value="分子生物学科" ${product.department === '分子生物学科' ? 'selected' : ''}>分子生物学科</option>
        <option value="生体制御学科" ${product.department === '生体制御学科' ? 'selected' : ''}>生体制御学科</option>
    </select>

    <button type="submit">変更</button>
</form>
`;

const LOGIN_VIEW = () => html`
<h1 class="title">ログイン</h1>
<div class = "form-group">
    <div id="message"></div> <!-- メッセージ表示用のエリア -->
    <label for ="email">メールアドレス</label>
    <input type="text" id="email" placeholder="メールアドレス" required />
    <label for ="password">パスワード</label>
    <input type="text" id="password" placeholder="パスワード"  required />
    <button id="login", type="submit">ログイン</button>
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


const MYPAGE_VIEW = (user , Product) => html`
<link rel="stylesheet" href="/static/my-page.css">
<div class="container">
  <h1 class="title">${user.name}さんのマイページ</h1>
  <button class="logout-btn" onclick="location.href='/logout'">ログアウト</button>

<table>
    <tr>
        <th scope="row">アカウント情報</th>
        <td>
            <p>学生番号:${user.studentID}<br></p>
            <p>学部:${user.faculty}<br></p>
            <p>アカウント作成日:${user.created_at}</p>
        </td>
    </tr>
    <tr>
        <th>アカウント情報の変更</th>
        <td>
            <button id="mypageButton" class="change-btn" onclick="location.href='/user/${user.id}/change'">変更</button>
        </td>
    </tr>
    <tr>
        <th>アカウントの削除</th>
        <td>
            <button id="mypageButton" type="button" class="delete-btn" onclick="deleteAccount()">削除</button>
            <div id="message"></div>
        </td>
    </tr>
<table>

  <h1 class="title">出品商品一覧</h1>
  <div class="product-list">
    ${Product.map((product) => html`
      <div class="product">
        <a href="/product/${product.id}">${product.content}</a>
        <p>価格: ${product.price} 円</p>
        <div class="product-actions">
          <button type="button" class="edit-btn" onclick="location.href='/product/${product.id}/change'">編集</button>
          <button type="button" class="delete-btn" onclick="deleteProduct(${product.id})">削除</button>
        </div>
      </div>
    `)}
  </div>
</div>

<script>
    async function deleteProduct(productID) {
        try {
            const response = await fetch('/mypage/product', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productID: productID })
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                window.location.href = result.redirectUrl;
            } else {
                alert('商品を削除できませんでした。');
                console.error('Error:', result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('エラーが発生しました。');
        }
    }

    async function deleteAccount() {
        if (confirm('本当にアカウントを削除しますか？')) {
            try {
                const response = await fetch('/mypage/account', {
                    method: 'DELETE',
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    window.location.href = result.redirectUrl;
                } else {
                    alert('アカウント削除に失敗しました。');
                }
            } catch (error) {
                console.error('エラー:', error);
                alert('エラーが発生しました。');
            }
        }
    }
</script>
`;



module.exports = {
    HTML,
    GATE,
    HTMLfortoppage,
    PRODUCT_REGISTER_FORM_VIEW,
    PRODUCT_CHANGE_FORM_VIEW,
    PRODUCT_LIST_VIEW,
    USER_REGISTER_FORM_VIEW,
    USER_CHANGE_VIEW,
    PRODUCT_VIEW,
    TOP_VIEW, 
    SEARCH_FORM_VIEW,
    SEARCH_RESULT_FORM_VIEW,
    LOGIN_VIEW,
    MYPAGE_VIEW
};
