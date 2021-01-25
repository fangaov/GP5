$(function(){

    // 请求数据
    $.ajax({
        url:'./data/goods.json',
        type: 'get',
        dataType: 'json',
        cache: false,
        success: function(json){
            var str = '';
            $.each(json,function(index,item){
                str +=`<div class="goods">
                <img src="${item.imgurl}">
                <p>${item.price}</p>
                <h3>${item.title}</h3>
                <div date-id="${item.id}">加入购物车</div>
                </div>`
            })
            $('.main').append(str);
        }
    });


    //加购物车
    $('.main').on('click','.goods div',function(){
        var id = $(this).attr('date-id');
        var goodsArr = [];
        var flag = false;
        if(localStorage.getItem('goods')){
            goodsArr = JSON.parse(localStorage.getItem('goods'));
        }
        $.each(goodsArr,function(index,item){
            if(item.id === id){
                item.num++;
                flag = true;
            }
        });
        if(!flag){
            goodsArr.push({'id':id,"num":1});
        }
        localStorage.setItem('goods',JSON.stringify(goodsArr));
        tips();
    });

    //加购物车悬浮提示框
    function tips(){
        $('<div class="tips"><span>√</span>加购成功！</div>').appendTo($('body')).animate({'top':'10%',opacity:0.1},800,function(){$(this).remove()});

    }

})