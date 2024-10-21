const fetchAndDisplayGoodsList = async () => {
    const response = await fetch("http://localhost:8000/");
    const goodsList = await response.json();
  
    const goodsListElement = document.getElementById("todo-list");
    goodsListElement.innerHTML = "";
  
    goodsList.forEach((todo) => {
  
      // テキストボックスを生成
      // <input type="text" class="task-textbox" value="..." />
      const textbox = document.createElement("input");
      textbox.type = "text";
      textbox.value = todo.name;
      textbox.classList.add("task-namebox");
  
      const price = document.createElement("input");
      price.type = "number";
      price.value = todo.price;
      price.classList.add("task-pricebox");
  
      // テキストボックスの値が変更されたときに、updateTodoTitle関数を呼び出す
      textbox.addEventListener("change", function () {
        updateGoodsTitle(todo.id, this.value);
      });
  
      // 削除ボタンを生成
      // <button class="delete-button">削除</button>
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "削除";
      deleteButton.classList.add("delete-button");
  
      // 削除ボタンがクリックされたときに、deleteTodo関数を呼び出す
      deleteButton.addEventListener("click", function () {
        deleteTodo(todo.id);
      });
  
      // <div>
      //   <input type="checkbox" />
      //   <input type="text" class="task-textbox" value="..." />
      //   <button class="delete-button">削除</button>
      // </div>
      const goodsElement = document.createElement("div");
      goodsElement.appendChild(textbox);
      goodsElement.appendChild(price);
      goodsElement.appendChild(deleteButton);
  
      goodsListElement.appendChild(goodsElement);
    });
  };
  
  
  // サーバー上のTODOアイテムの title を更新する
  const updateGoodsTitle = async (id, name, price) => {
    const response = await fetch(`http://localhost:8000/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, price }),
    });
  
    if (response.status === 200) {
      fetchAndDisplayGoodsList();
    }
  };
  
  // サーバーに新しいTODOアイテムを追加する
  const addGoods = async () => {
    const goodsTitleInput = document.getElementById("todo-title");
    const goodsPriceInput = document.getElementById("goods-price");
    const goodsTitle = goodsTitleInput.value;
    const goodsPrice = parseFloat(goodsPriceInput.value);
    console.log({ name: goodsTitle, price: goodsPrice });
  
    if (goodsTitle) {
      const response = await fetch("http://localhost:8000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: goodsTitle, price: goodsPrice }),
      });
  
      if (response.status === 200) {
        goodsTitleInput.value = "";
        goodsPriceInput.value = "";
        fetchAndDisplayGoodsList();
      }
    }
  };
  
  // サーバーからTODOアイテムを削除する
  const deleteTodo = async (id) => {
    const response = await fetch(`http://localhost:8000/${id}`, {
      method: "DELETE",
    });
  
    if (response.status === 200) {
      fetchAndDisplayGoodsList();
    }
  };
  
  // ボタンが押されたときにaddTodo関数を呼び出す
  const addButton = document.getElementById("add-button");
  addButton.addEventListener("click", addGoods);
  
  document.addEventListener("DOMContentLoaded", fetchAndDisplayGoodsList);