/*
* -------------------
* 待辦事項
* -------------------
* *. 可拖放上傳店家菜單
* *. 資料寫入 Google Sheets
* *. 收錢狀態
* *. input按enter可送出
*/
var orderUl = document.getElementById('todayOrder');
// var orderView = document.getElementById('orderView');
var prompt = document.getElementById('prompt') || 0;


//自訂函數：使用複數 setAttribute
function setAttributes(element, attrs) {
    Object.keys(attrs).forEach(key => element.setAttribute(key, attrs[key]));
}

/*
* -------------------
* 更新訂購列表
* -------------------
*/
updateOrderList();

function updateOrderList() {
    //取出資料
    var data = localStorage.getItem(getDate());
    data = data ? JSON.parse(data) : [];

    //先清空DOM元素
    orderUl.innerText = "";

    //判斷localStorage有無資料
    if (data.length > 0) {
        var total = 0;

        //輸出至畫面
        for (var i = 0; i < data.length; i++) {
            var list = document.createElement('li');
            var aObj = document.createElement('a');

            var paymentCk = document.createElement('input'); //創建收款與否checkbox
            setAttributes(paymentCk, {
                'type': 'checkbox',
                'onclick': 'orderPayment(this)'
            });
            paymentCk.checked = data[i].payment;

            setAttributes(list, {
                'data-num': i,
                'data-payment': data[i].payment
            });
            setAttributes(aObj, {
                'href': '#',
                'id': 'delItem',
                'onclick': 'delOrderItem(this)'
            });
            aObj.innerText = '刪除';
            list.innerText = `${data[i].name} / ${data[i].type} / ${data[i].price} 元`;
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
document.getElementById('orderAdd').onclick = function () {
    var newData = document.getElementById('text').value;
    var data = localStorage.getItem(getDate()); //日期為key
    var total = 0;
    //處理字串
    newData = newData.trim(); // 去除文字前後空白
    newData = newData.split('/'); // 以 / 拆分字串

    //如果localstorage有資料就讀出並轉陣列，無則給空陣列
    data = data ? JSON.parse(data) : [];

    //input資料組物件
    var order = {
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
    var data = localStorage.getItem(getDate()); //日期為key
    var paymentLi = thisItem.parentNode;

    //如果localstorage有資料就讀出並轉陣列，無則給空陣列
    data = data ? JSON.parse(data) : [];

    //自訂屬性紀錄點選狀態，供存取資料取用
    paymentLi.setAttribute('data-payment', thisItem.checked); //toggle payment status

    var listObj = document.getElementById('todayOrder').children;

    //循環遍歷比對每一li與資料庫有無不同，有則表示有更改
    for (var i = 0; i < listObj.length; i++) {
        //取得付款狀態
        var tempItem = listObj[i].getAttribute('data-payment');

        // tempItem = tempItem !== 'false'; //string to boolean

        //判斷如果資料庫取出的值是字串，就轉成 boolean
        tempItem = typeof tempItem === 'string' ? tempItem !=='false' : tempItem;

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
            // console.log(key + " x " + counts[key]);
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
    localStorage.clear();
    updateOrderList();
    // orderCount();
}

/*
* -------------------
* 取得當日日期，如20200407，每天只能存取當日的資料
* -------------------
*/
function getDate() {
    var today = new Date;
    var todayMonth = today.getMonth() + 1;
    todayMonth = todayMonth < 10 ? "0" + todayMonth : todayMonth;
    var todayDate = today.getDate()
    todayDate = todayDate < 10 ? "0" + todayDate : todayDate;
    return today.getFullYear() + "" + todayMonth + "" + todayDate
    // console.log(today.getFullYear() + "" + todayMonth + "" + todayDate);
}