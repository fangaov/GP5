$(function(){
    if(localStorage.getItem('goods').length !== 2){

        var goods = JSON.parse(localStorage.getItem('goods'));
        // ajax获取数据加载到页面
        $.ajax({
            url:'./data/goods.json',
            type: 'get',
            datetype:'json',
            cache: false,
            success: function(json){
                adddate(json,goods);
            }
        });
    }else{
        //没有数据
        $('<li>购物车暂无商品哦~</li>').appendTo($('.list'));
    }

    // 添加数据到购物车
    function adddate(date,goods){
        $.each(goods,function(index,item){
            $.each(date,function(i,val){
                if(item.id === val.id){
                    // 字符串模板
                    var str = `
                       <li> <input type="checkbox" class="check">
                        <img src="${val.imgurl}">
                        <h3>${val.title}</h3>
                        <p>￥${val.price}</p>
                        <span class="cut">-</span><input type="text" value="${item.num}" class="number"><span class="add">+</span>
                        <b>￥${val.price*item.num}</b>
                        <em data-id="${val.id}">删除</em></li>
                    `;
                    // 将li加到ul里的后面
                    $(str).appendTo('.list');
                }
            });
        });
    }

    // 小计加
    $('.list').on('click','.add',function(){
        // 保存this值
        _this = $(this);
        var n = $(this).prev().val();
        n++;
        var goodsArr = JSON.parse(localStorage.getItem('goods'));
        $.each(goodsArr,function(index,item){
            if(item.id === _this.siblings('em').attr('data-id')){
                // 将num的值修改并保存
                item.num = n;
                localStorage.setItem('goods',JSON.stringify(goodsArr));
                return false;
            }
        });
        // 修改输入框的value
        $(this).prev().val(n);
        // 得到单价
        var money = $(this).siblings('p').text().substr(1);
        // 修改价格
        $(this).next().text("￥"+(n*money));
        // 判断当前商品是否已选中，若选中则更新总价及总商品数
        if($(this).siblings('.check').attr('checked')){
            totalUpdates();
        }
    });
    // 小计减
    $('.list').on('click','.cut',function(){
        _this = $(this);
        var n = $(this).next().val();
        n--;
        // 若input值小于0则提示
        if( n < 0){
            n = 0;
            alert('数值不能小于0!');
        }else{
            // 获取缓存数据
            var goodsArr = JSON.parse(localStorage.getItem('goods'));
            $.each(goodsArr,function(index,item){
                if(item.id === _this.siblings('em').attr('data-id')){
                    item.num = n;
                    // 更新缓存数据
                    localStorage.setItem('goods',JSON.stringify(goodsArr));
                    return false;
                }
            });
            // 更新商品价格
            var money = $(this).siblings('p').substr(1);
            $(this).siblings('b').text("￥"+(n*money));
            $(this).next().val(n);
        }
        // 判断此商品是否被选中
        if($(this).siblings('.check').attr('checked')){
            totalUpdates();
        }
    });

    // 输入框直接修改数量
    $('.list').on('blur','.number',function(){
        var n =  $(this).val();
        var _this = $(this);
        var goodsArr = JSON.parse(localStorage.getItem('goods'));
        $.each(goodsArr,function(index,item){
            // 匹配相同id的数据
            if(item.id === _this.siblings('em').attr('data-id')){
                if((n == 0) || (n == -1) || Number(n) ){
                    // input的值不能小于0
                    if(n<0){
                        alert('数量不能小于0!');
                        // 将修改前的数量赋值回去
                        n = item.num;
                        _this.val(item.num);
                    }
                    // 更新缓存
                    item.num = n;
                    localStorage.setItem('goods',JSON.stringify(goodsArr));
                }else{
                    alert('不能输入非数字！');
                    _this.val(item.num);
                    n = item.num;
                }
                return false;
            }
        });
        var money = $(this).siblings('p').text().substr(1);
        $(this).siblings('b').text("￥"+(n*money));
        // 若此商品被勾选则更新商品总数和商品总价
        if($(this).siblings('.check').attr('checked')){
            totalUpdates();
        }
    });

    // 删除功能
    $('.list').on('click','em',function(){
        _this = $(this);
        var goodsArr = JSON.parse(localStorage.getItem('goods'));
        $.each(goodsArr,function(index,item){
            if(item.id === _this.attr('data-id')){
                // 删除此商品的缓存
                goodsArr.splice(index,1);
                localStorage.setItem('goods',JSON.stringify(goodsArr));
                return false;
            }
        });
        // 将此商品从购物车删除
        $(this).closest('li').remove();
        checkUp(); 
        // 更新总价和总计
        totalUpdates();
    });

    // 全选框点击事件
    $('.header').on('click','.allcheck',function(){
        var check = $(this).attr('checked');
        // 全选为选中则所有度复选框选中，否则不选中
        if(check === 'checked'){
            $('.list li .check').attr('checked',true);
        }else{
            $('.list li .check').attr('checked',false);
        }
        // 更新总价和总计
        totalUpdates();
    });


    // 子复选框点击事件
    $('.list').on('click','.check',function(){
        // 点击后检查是否全选
        checkUp();
        // 更新总价和总计
        totalUpdates();
    });

    // 检查全选
    function checkUp(){
        var check = $('.list li .check');
        var n = $('.list li .check').length;
        var flag = true;
        // n长度为0则商品列表里没有商品取消全选，否则只要有一个子复选框没有选中就取消全选
        if(n !== 0){
            for(var i=0;i<n;i++){
                if(!check[i].checked){
                    flag = false;
                }
            }
        }else{
            flag = false;
        }
        $('.header input').attr('checked',flag);
    };
    
    //商品总数更新
    function totalUpdates(){
        var goods = JSON.parse(localStorage.getItem('goods'));
        // 保存为dom对象
        var bs = $('.list li');
        // 保存长度
        var n = bs.length;
        // 总计
        var total = 0;
        // 总价
        var totalprice = 0;
        // 查找选中的商品并计算总计和总价
        for(var i=0;i<n;i++){
            if($('.list li .check').eq(i).attr('checked') === 'checked'){
                var id = $('.list li em').eq(i).attr('data-id');
                $.each(goods,function(index,item){
                    if(id === item.id){
                        total += Number(item.num);
                        totalprice += item.num*$('.list li p').eq(i).text().substr(1);
                    }
                });
            }
        }
        // 修改总计
        $('.total').text(total);
        // 修改总价
        $('.totalPrice').text("￥"+totalprice);
    }
});