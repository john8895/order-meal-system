/*
* -------------------
* 待辦事項
* -------------------
* *. 可拖放上傳店家菜單
* *. 資料寫入 Google Sheets
* *. input按enter可送出
* *. 計算已收錢筆數，未收筆數，已收金額，未收金額
*/
let orderUl = document.getElementById('todayOrder');
let prompt = document.getElementById('prompt') || 0;


//自訂函數：使用複數 setAttribute
function setAttributes(element, attrs) {
    Object.keys(attrs).forEach(key => element.setAttribute(key, attrs[key]));
}

/*
* -------------------
* 儲存資料
* -------------------
*/
function saveHandle() {
    // let data = {
    //     name:"hanmeimei",
    //     age:88
    // }
    // var content = JSON.stringify(data);
    // var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    // saveAs(blob, "save.json");
}

/*
* -------------------
* 上傳菜單
* -------------------
*/
(function uploadImage() {
    let file = document.getElementById('uploadFile');
    let imgView = document.getElementById('imageView');

    //有上傳即執行
    file.addEventListener('change', function () {
        // 宣告 FileReader
        let reader = new FileReader();
        //如果有上傳
        if (file.files.length > 0) {
            //轉換 base64 圖片編碼
            reader.readAsDataURL(file.files[0])
        }

        //圖片上傳完成後
        reader.addEventListener('load', function (e) {
            //在畫面顯示出來
            imgView.innerHTML = `<img src="${this.result}">`;

            //每次都清除資料庫，只留一張圖
            let data = [{
                'img': this.result
            }];

            //儲存至localStorage
            localStorage.setItem(getDate() + "-img", JSON.stringify(data));
        });
    })
})();


/*
* -------------------
* 更新訂購列表
* -------------------
*/
updateOrderList();

function updateOrderList() {
    const imgView = document.getElementById('imageView');
    //取出資料
    let data = localStorage.getItem(getDate());
    let imgData = localStorage.getItem(getDate() + "-img") || 0; //日期為key

    if(imgData){
        imgData = JSON.parse(imgData);
        //讀入資料庫圖片
        let newImg = document.createElement('img');
        newImg.src = imgData[0].img;
        imgView.appendChild(newImg);
    }


    //有資料讀入，否則給空
    data = data ? JSON.parse(data) : [];

    //先清空DOM元素
    orderUl.innerText = "";

    //判斷localStorage有無資料
    if (data.length > 0) {
        var total = 0;

        //輸出至畫面
        for (let i = 0; i < data.length; i++) {
            let list = document.createElement('li');
            let aObj = document.createElement('a');

            let paymentCk = document.createElement('input'); //創建收款與否checkbox
            setAttributes(paymentCk, {
                'type': 'checkbox',
                'onclick': 'orderPayment(this)',
                'id': 'orderPaymentCk-' + i
            });
            paymentCk.checked = data[i].payment;

            setAttributes(list, {
                'data-num': i,
                'data-payment': data[i].payment,
                'class': data[i].payment ? 'paid' : ''
            });
            setAttributes(aObj, {
                'href': '#',
                'id': 'delItem',
                'onclick': 'delOrderItem(this)',
                'class': 'delBtn btn btn-sm btn-outline-danger'
            });
            // aObj.innerText = '刪除';
            list.innerHTML = `<label for="orderPaymentCk-${i}">${data[i].name} / ${data[i].type} / ${data[i].price} 元</label>`;
            list.appendChild(aObj);
            list.appendChild(paymentCk);


            orderUl.appendChild(list);
            total += parseInt(data[i].price);
        }
        prompt.innerText = `當前資料共 ${data.length} 筆，總金額 ${total} 元`;
    } else { //無資料
        prompt.innerText = "資料庫無資料";
    }
    //傳至【訂購統計】
    orderCount(total);
}

/*
* -------------------
* 新增項目
* -------------------
*/
const orderAddBtn = document.getElementById('orderAdd');
const orderInput = document.getElementById('orderInput');
orderAddBtn.addEventListener('click', orderAddHandle);
orderInput.addEventListener('keyup', orderAddHandle);

function orderAddHandle(event) {
    if (event.keyCode === 13 || event.type === "click") {
        let newData = document.getElementById('orderInput');
        let data = localStorage.getItem(getDate()); //日期為key
        //處理字串
        newData = newData.value.trim().split('/'); // 去除文字前後空白，以 / 拆分字串

        //如果localstorage有資料就讀出並轉陣列，無則給空陣列
        data = data ? JSON.parse(data) : [];

        //input資料組物件
        let order = {
            name: newData[0],
            type: newData[1],
            price: newData[2],
            payment: false
        };
        data.push(order); //插入新資料至原資料中

        //儲存至localStorage
        localStorage.setItem(getDate(), JSON.stringify(data));

        //輸出至畫面
        updateOrderList();
    }

};

/*
* -------------------
* 刪除項目
* -------------------
*/
function delOrderItem(thisItem) {
    var delItem = thisItem.parentElement;
    var delNum = thisItem.parentElement.getAttribute('data-num');
    var data = localStorage.getItem(getDate()); //日期為key

    var r = confirm("刪除不能復原，你確定嗎？");
    if (!r) return;
    //如果localstorage有資料就讀出並轉陣列，無則給空陣列
    data = data ? JSON.parse(data) : [];
    data.splice(delNum, 1); // 刪除項目
    delItem.remove(); // 移除DOM element

    //儲存至localStorage
    localStorage.setItem(getDate(), JSON.stringify(data));

    //輸出至畫面
    updateOrderList();
}


/*
* -------------------
* 付款與否
* -------------------
*/
function orderPayment(thisItem) {
    let data = localStorage.getItem(getDate()); //日期為key
    let paymentLi = thisItem.parentNode;

    //如果localstorage有資料就讀出並轉陣列，無則給空陣列
    data = data ? JSON.parse(data) : [];

    //自訂屬性紀錄點選狀態，供存取資料取用
    paymentLi.setAttribute('data-payment', thisItem.checked); //toggle payment status

    paymentLi.setAttribute('class', thisItem.checked ? 'paid' : '')


    var listObj = document.getElementById('todayOrder').children;

    //循環遍歷比對每一li與資料庫有無不同，有則表示有更改
    for (var i = 0; i < listObj.length; i++) {
        //取得付款狀態
        var tempItem = listObj[i].getAttribute('data-payment');

        //判斷如果資料庫取出的值是字串，就轉成 boolean
        tempItem = typeof tempItem === 'string' ? tempItem !== 'false' : tempItem;

        // 如果 payment 值與資料庫不同，表示有更新
        if (tempItem !== data[i].payment) {
            //更薪資料庫
            data[i].payment = tempItem;
        }
    }

    //儲存至localStorage
    localStorage.setItem(getDate(), JSON.stringify(data));

    //輸出至畫面
    updateOrderList();
}

/*
* -------------------
* 訂購統計
* -------------------
*/
function orderCount(total) {
    var totalNum = document.getElementById('totalNum');
    var data = localStorage.getItem(getDate()); //日期為key
    var orderCountUl = document.getElementById('orderCountUl');
    var orderNumShow = document.getElementById('orderNum');

    total = total ? total : total = 0;
    totalNum.innerText = `總金額 ${total} 元`;

    //取得資料
    data = JSON.parse(data);

    if (data) {
        //計算重複值
        var counts = {};
        for (var i = 0; i < data.length; i++) {
            var num = data[i].type;
            counts[num] = counts[num] ? counts[num] + 1 : 1;
        }
        //打印出結果  ex:雞腿飯 x 3, 排骨飯 x 2
        //forEach 定義為 array 的 prototype 不能直接用 object.forEach
        orderCountUl.innerText = "";
        var orderNum = 0;
        Object.keys(counts).forEach(function (key) {
            var liObj = document.createElement('li');
            liObj.innerText = key + " x " + counts[key];
            orderCountUl.appendChild(liObj)
            orderNum += counts[key]
        });
        orderNumShow.innerText = orderNum;
    }

    total = total ? total : total = 0;
    totalNum.innerText = `總金額 ${total} 元`
}

/*
* -------------------
* 清除資料
* -------------------
*/
function clearLocalstorage() {
    let r = confirm("刪除資料不能復原，你確定嗎？");
    if (!r) return;
    localStorage.clear();
    updateOrderList();
}

/*
* -------------------
* 取得當日日期，如20200407，每天只能存取當日的資料
* -------------------
*/
function getDate() {
    let today = new Date;
    let todayMonth = today.getMonth() + 1;
    todayMonth = todayMonth < 10 ? "0" + todayMonth : todayMonth;
    let todayDate = today.getDate();
    todayDate = todayDate < 10 ? "0" + todayDate : todayDate;
    return today.getFullYear() + "" + todayMonth + "" + todayDate
}