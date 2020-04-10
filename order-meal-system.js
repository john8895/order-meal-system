/*
* -------------------
* 待辦事項
* -------------------
* 1. 刪除項目按鈕
* 2. 訂購統計
*/
var orderUl = document.getElementById('todayOrder');
var orderView = document.getElementById('orderView');
var prompt = document.getElementById('prompt') || 0;
// var total = 0;


/*
* -------------------
* 更新訂購列表
* -------------------
*/
updateOrderList();

function updateOrderList() {
    var dataList = localStorage.getItem(getDate());
    dataList = dataList ? JSON.parse(dataList) : [];
    //先清空元素
    orderUl.innerText = "";

    //判斷localStorage有無資料
    if (dataList.length > 0) {
        var total = 0;
        //console.log("資料庫有資料");

        for (var i = 0; i < dataList.length; i++) {
            var list = document.createElement('li');
            var aObj = document.createElement('a');
            aObj.setAttribute('onclick', 'delOrderItem(this)');
            aObj.href = "#";
            aObj.id = 'delItem';
            aObj.innerText = '刪除';
            list.innerText = `${dataList[i].name} / ${dataList[i].type} / ${dataList[i].price} 元`;
            list.appendChild(aObj);
            orderUl.appendChild(list);
            total += parseInt(dataList[i].price);
        }
        prompt.innerText = `當前資料共 ${dataList.length} 筆，總金額 ${total} 元`;
        // console.log(`當前資料共 ${dataList.length} 筆，總金額 ${total} 元`);
        // console.log("updateOrderList--for--" + total);

    } else { //無資料
        prompt.innerText = "資料庫無資料";

    }
    orderCount(total);

}

document.getElementById('btn1').onclick = function () {
    var newData = document.getElementById('text').value;
    var data = localStorage.getItem(getDate()); //日期為key
    var total = 0;
    newData = newData.trim();
    newData = newData.split('/');

    data = data ? JSON.parse(data) : []; //如果localstorage有資料就讀出並轉陣列，無則給空陣列

    var order = {
        name: newData[0],
        type: newData[1],
        price: newData[2]
    };
    data.push(order); //插入新資料
    //儲存資料
    localStorage.setItem(getDate(), JSON.stringify(data));

    orderUl.innerText = "";
    for (var i = 0; i < data.length; i++) {
        var list = document.createElement('li');
        var aObj = document.createElement('a');
        aObj.setAttribute('onclick', 'delOrderItem(this)');
        aObj.href = "#";
        aObj.id = 'delItem';
        aObj.innerText = '刪除';
        list.innerText = `${data[i].name} / ${data[i].type} / ${data[i].price} 元`;
        list.appendChild(aObj);
        orderUl.appendChild(list);
        prompt.innerText = "";
        total += parseInt(data[i].price);
    }
    prompt.innerText = `當前資料共 ${data.length} 筆，總金額 ${total} 元`;
    orderCount(total);

};


/*
* -------------------
* 刪除項目
* -------------------
*/
var delBtn = document.getElementById('delItem') || 0;
// delBtn.onclick = function () {
//
// }

function delOrderItem(thisItem) {
    thisItem.parentElement.remove();
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

    // console.log("orderCount----" + total);
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
            var liObj=document.createElement('li');
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