/*
 * Created by miyashita_ak on 17/01/20.
 */


var Page = function(){

    //初期化
    this.init = function(){
        setList(false);
        $('#createNew').hide();
    };

};
//他に初期化しておくものがなければ
//$(function())の中に直接書いてもよいかも？


var p = new Page();
var array =[];
$(function(){
    p.init();
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
});


function setList( doneMode ) {
    console.log(doneMode);
    $.ajax({
        type: 'GET',
        url: '../api/1/todo/',
        success: function (json) {
            // 成功時の処理;
            array = [];
            if (json.length != null) {
                for (var i = 0; i < json.length; i++) {
                    if(doneMode === "all") {
                        array.push(json[i]);
                    }else if (doneMode) {
                        if(json[i].done) {
                            array.push(json[i]);
                        }
                    }else if(!json[i].done) {
                        array.push(json[i]);
                    }
                }
            }
            displayList(array);
        }
    });
}

function displayList( arrayList ){
    $('#sortable').empty();
    for(var i = 0 ; i < arrayList.length; i++) {
        var mess = "<div class='panel panel-default task'>";
        mess += " <div class='panel-body' value='"+ arrayList[i].id +"'>";
        mess += "<input type='checkbox' class='task_done' onclick='clickDoneBtn(this)' ";
        if (arrayList[i].done){
            mess+= "checked";
        }
        mess += ">";
        mess += "<a class='task_title'>";
        mess += arrayList[i].title;
        mess += "</a>";
        mess += "<span class='task_star glyphicon glyphicon-star";
        if(!arrayList[i].star){
            mess += "-empty";
        }
        mess += "'></span>";
        mess += "<div class='t_time'>";
        mess += "<span class='glyphicon'>&#xe023;</span>";
        mess += "<span class='task_day'>";
        mess += arrayList[i].time_limit;
        mess += "</span>";
 //       mess += "<span class='task_time_limit'>あと";
 //       mess += new Date();
 //       mess += "日</span>";
        mess += "</div>";
        mess += "<a class='btn btn_trash pull-right' onclick='clickDeleteBtn(this)'><span class='glyphicon glyphicon-trash'>Trash</span></a>";
        mess += "<a class='btn btn_star pull-right' onclick='clickStarBtn(this)'><span class='glyphicon glyphicon-star";
        if(arrayList[i].star){
            mess += "-empty'>UnStar</span></a>";
        }else{
            mess += "'>Star</span></a>";
        }
        mess += "<a class='btn btn_done pull-right' onclick='clickDoneBtn(this)'><span class='glyphicon glyphicon-";
        if(arrayList[i].done){
            mess += "unchecked'>Open</span></a>";
        } else {
            mess += "ok'>Done</span></a>";
        }
        mess += "</div></div>";
        $('#sortable').append(mess);
    }
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
}

$(document).on('click','#all',function() {
    changeMode("all");
    setList("all");

});

$(document).on('click','#sort_non',function() {
    changeMode('nonDone');
    setList(false);

});

$(document).on('click','#sort_done',function() {
    changeMode('done');
    setList(true);
});

$(document).on('click','#sort_star', function() {
    changeMode("star");
    for(var i = 0 ; i < array.length; i++) {
        if(!array[i].star){
            array.splice( i, 1 ) ;
        }
    }
    displayList(array);
});

$(document).on('click','#sort_deadline', function() {
    changeMode("time");
    //締め切り順にソートするプログラム実行
    array.sort(function(a,b){
        if(a.time_limit < b.time_limit) return -1;
        if(a.time_limit > b.time_limit) return 1;
        return 0;
    });
    displayList(array);
});


function changeMode(mode) {

    var before = $('#sort_mode').attr('mode');
    $('#sort_mode').attr('mode', mode);

}

$(document).on('click','#createBtn',function() {
    $('#createNew').show();
});
$(document).on('click','#cansel',function() {
    $('#createNew').hide();
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
            setList(false);
            displayList(array);
            $('#createNew').hide();
        }
    });
});


function clickDoneBtn(obj) {
    var list= array[searchList($(obj).parent().attr("value"))];
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
    var list= array[searchList($(obj).parent().attr("value"))];
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

function clickDeleteBtn(obj){
    var list= array[searchList($(obj).parent().attr("value"))];
    $.ajax({
        type: 'DELETE',
        url: '/api/1/todo/' + list.id,
        success: function (json) {
            setList(false);
        }
    });
}

//どのTODOなのかを特定するための関数を作成する必要があり、引数はValue（Id)
function searchList(value) {
    var result =null;
    for(var i = 0; i < array.length; i++){
        //value とidが一緒かどうかを判断
        if( value == array[i].id )
            return i;//一緒なら配列の値を返す
    }
    alert('画面を読み込みなおしてください。');
    //もしないような値があったら-1とかするべきかな？　errorはく的なしょりも必要
    return -1;
}


function calTime(time){
    //
    var nowTime;

}

