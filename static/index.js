/**
 * Created by miyashita_ak on 17/01/20.
 */
var Page = function(){

    //初期化
    this.init = function(){
        setList(false);
    };

};
//他に初期化しておくものがなければ
//$(function())の中に直接書いてもよいかも？


var p = new Page();
var array =[];
$(function(){
    p.init();

});

function setList( doneMode ) {
    console.log(doneMode);
    $.ajax({
        type: 'GET',
        url: '../api/1/todo/',
        success: function (json) {
            // 成功時の処理;
            $('#board').empty();
            array = [];
            if (json.length != null) {
                for (var i = 0; i < json.length; i++) {
                    var mess="";
                    if(doneMode === "all") {
                        array.push(json[i]);
                    }else if (doneMode) {
                        if(json[i].done) {
                            array.push(json[i]);
                        }
                    }else if(!json[i].done) {
                        array.push(json[i]);
                    }
                    $('#board').append(mess);
                }
            }
            displayList(array);
        }
    });
}

function displayList( arrayList ){
    $('#board').empty();
    for(var i = 0 ; i < arrayList.length; i++) {
        var mess = "<p value='" + arrayList[i].id + "'>";
        mess += "<input type='checkbox' class='l_done"+arrayList[i].done +"' onclick='clickDoneBtn(this)'>";
        mess += arrayList[i].title;
        mess += "<input type='checkbox' class='l_star " + arrayList[i].star +"' onclick='clickStarBtn(this)'>" ;
        mess += "<a>"+ arrayList[i].time_limit+"</a></p>";
        $('#board').append(mess);
    }
}


$(document).on('click','#all',function() {setList("all")});
$(document).on('click','#sort_non',function() {setList(false)});
$(document).on('click','#sort_done',function() {setList(true)});
$(document).on('click','#sort_star', function() {
    for(var i = 0 ; i < array.length; i++) {
        if(!array[i].star){
            array.splice( i, 1 ) ;
        }
    }
    displayList(array);
});

$(document).on('click','#sort_deadline', function() {
    //締め切り順にソートするプログラム実行
    array.sort(function(a,b){
        if(a.time_limit < b.time_limit) return -1;
        if(a.time_limit > b.time_limit) return 1;
        return 0;
    });
    console.log(Object.keys(array));
    displayList(array);
});


//create押下時
$(document).on('click','#create', function() {

    $.ajax({
        type: 'POST',
        url: '../api/1/todo/',
        contentType: 'application/json',
        data: JSON.stringify(
            {
                "done": $('#done').is(':checked'),
                "id": 0,
                "star": $('#star').is(':checked'),
                "tags": [
                    {
                        "id": 0,
                        "name": "string"
                    }
                ],
                "time_limit": $('#deadline').val(),
                "title": $('#todo').val()
            }),
        success: function (json) {
            displayList(true);
        }
    });
});



function clickDoneBtn(obj) {
    //　どのTODOなのかを特定するための関数を作成する必要があり、引数はValue（Id)
    //  var list= array[$(obj).parent().attr("value")-1];
    var list= array[0];
    $.ajax({
        type: 'PUT',
        url: '/api/1/todo/' + list.id,
        contentType: 'application/json',
        data: JSON.stringify(
            {
                "done": !list.done,
                "star": list.star,
                "tag_ids": [
                    1
                ],
                "time_limit": list.time_limit,
                "title": list.title
            }),
        success: function (json) {
            setList(false);
        }
    });
}

function clickStarBtn(obj){
//    var list= array[$(obj).parent().attr("value")-1];
//　どのTODOなのかを特定するための関数を作成する必要があり、引数はValue（Id)
    var list= array[0];

    $.ajax({
        type: 'PUT',
        url: '/api/1/todo/' + list.id,
        contentType: 'application/json',
        data: JSON.stringify(
            {
                "done": list.done,
                "star": !list.star,
                "tag_ids": [
                    1
                ],
                "time_limit": list.time_limit,
                "title": list.title
            }),
        success: function (json) {
            setList(false);
        }
    });
}



//どのTODOなのかを特定するための関数を作成する必要があり、引数はValue（Id)
function searchList(value) {
    var result =null;
    var num = 0;


    return num;
}
