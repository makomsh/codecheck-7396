/*
 * Created by miyashita_ak on 17/01/20.
 */


var Page = function(){

    //初期化
    this.init = function(){
 //       setList(false);
        $('#createNew').hide();
        changeMode("sort_non");
        display();
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

function display() {
    $.ajax({
        type: 'GET',
        url: '../api/1/todo/',
        success: function (json) {
            // 成功時の処理;
            setLists(json);
            changeDisplay();
        }
    });

}

function setLists(arrayList) {
    $('#sortable').empty();
    for (var i = 0; i < arrayList.length; i++) {
        var mess = "<div class='panel panel-default task'>";
        mess += " <div class='panel-body' value='" + arrayList[i].id + "'>";
        mess += "<input type='checkbox' class='task_done' onclick='clickDoneBtn("+ arrayList[i].id +")' ";
        if (arrayList[i].done) {
            mess += "checked";
        }
        mess += ">";
        mess += "<a class='task_title'>";
        mess += arrayList[i].title;
        mess += "</a>";
        mess += "<span class='task_star glyphicon glyphicon-star";
        if (!arrayList[i].star) {
            mess += "-empty";
        }
        mess += "'></span>";
        mess += "<div class='t_time'>";
        mess += "<span class='glyphicon'>&#xe023;</span>";
        if (arrayList[i].time_limit != null) {

            mess += "<span class='task_day'>";
            mess += arrayList[i].time_limit;
            mess += "</span>";

            var lim = calTime(arrayList[i].time_limit);
            if (lim == 0) {
                mess += "<span class='task_time_limit today'>今日</span>";
            } else if (!arrayList[i].done) {
                if (lim < 0) {
                    mess += "<span class='task_time_limit over'>期限が過ぎています！</span>";
                } else {
                    mess += "<span class='task_time_limit'>あと" + lim + "日</span>";
                }
            }
            mess += "</div>";
        }
        mess += "<a class='btn btn_trash pull-right' onclick='clickDeleteBtn(" + arrayList[i].id + ")'><span class='glyphicon glyphicon-trash'>Trash</span></a>";
        mess += "<a class='btn btn_star pull-right' onclick='clickStarBtn(" + arrayList[i].id + ")'><span class='glyphicon glyphicon-star";
        if (arrayList[i].star) {
            mess += "-empty'>Star</span></a>";
        } else {
            mess += "'>Star</span></a>";
        }
        mess += "<a class='btn btn_done pull-right' onclick='clickDoneBtn("+ arrayList[i].id +")'><span class='glyphicon glyphicon-";
        if (arrayList[i].done) {
            mess += "unchecked'>Open</span></a>";
        } else {
            mess += "ok'>Done</span></a>";
        }
        mess += "</div></div>";
        $('#sortable').append(mess);
    }
    $("#sortable").sortable();
    $("#sortable").disableSelection();

}


function calTime(time){
    var end = new Date(time);
    var now = new Date();
    var day = Math.floor((end.getTime() - now.getTime())/(60*60*24*1000))+1;

    return day;
}



function changeDisplay() {
    var mode = $('#sort_mode').attr('mode');

    var lists = $('#board').find('.panel-body');
    if(mode != "sort_deadline") {
        for (var i = 0; i < lists.length; i++) {
            var d = $('.task_done', lists[i]);
            var s = $('.task_star', lists[i]);
            var t = $('.task_day', lists[i]);
            var listParent = $(lists[i]).parent(".panel");
            if(mode == "sort_done") {
                if(d.is(':checked')){
                    listParent.show();
                } else {
                    listParent.hide();
                }
            } else if(mode == 'sort_non'){
                if(!d.is(':checked')){
                    listParent.show();
                } else {
                    listParent.hide();
                }
            }else if (mode == "sort_star") {
                if($(s).hasClass('glyphicon-star')) {
                    listParent.show();
                } else {
                    listParent.hide();
                }
            } else {
                listParent.show();
            }
        }
    }else{
        //じかんごとに要素を並び替える。
        //doneは排除。nullは下。締め切り近い順
    }


}





/*表示の仕方を変更するためのメソッド*/

function changeMode(mode) {

    var before = $('#sort_mode').attr('mode');
    $('#sort_mode').attr('mode', mode);




    $('#' + before).toggleClass('btn-primary');
    $('#' + before).toggleClass('btn-default');
    $('#' + mode).toggleClass('btn-primary');
    $('#' + mode).toggleClass('btn-default');



    //前のボタンをdefaltに、新しいソートボタンをprimalyにclassチェンジ

}


$(document).on('click','#all',function() {
    changeMode("all");
    changeDisplay();
});

$(document).on('click','#sort_non',function() {
    changeMode('sort_non');
    changeDisplay();

});

$(document).on('click','#sort_done',function() {
    changeMode('sort_done');
    changeDisplay();
});

$(document).on('click','#sort_star', function() {
    changeMode("sort_star");
    changeDisplay();
});

$(document).on('click','#sort_deadline', function() {
    changeMode("sort_deadline");
    changeDisplay();
});



/*新しいタスクを作成するためのモーダル用ボタンのイベント*/


$(document).on('click','#createBtn',function() {
    $('#createNew').show();
});
$(document).on('click','#cansel',function() {
    $('#createNew').hide();
});
$(document).on('click','.close',function() {
    $('#createNew').hide();
});


//create押下時（タスクを作成するとき）

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
            display();
            $('#createNew').hide();
        }
    });
});




/*それぞれのTaskないのボタンのイベント*/

/*完了・未完了きりかえ*/
function clickDoneBtn(id) {

    var lists = $('#board').find('.panel-body');

    for (var i = 0; i < lists.length; i++) {
        if ( $(lists[i]).attr('value') == id ) {
            console.log('same');
            var done = $('.task_done', lists[i]);
            var star = $('.task_star', lists[i]);
            var time_limit = $('.task_day', lists[i]).text();
            var title = $('.task_title', lists[i]).text();
            console.log(title);
            $.ajax({
                type: 'PUT',
                url: '/api/1/todo/' + id,
                contentType: 'application/json',
                data: JSON.stringify(
                    {
                        "done": !done.is(':checked'),
                        "star": $(star).hasClass('glyphicon-star'),
                        "tag_ids": [
                            1
                        ],
                        "time_limit": time_limit,
                        "title": title
                    }),
                success: function (json) {
                    display();
                }
            });


            break;
        }
    }

}



/*優先度の設定*/
function clickStarBtn(id) {

    var lists = $('#board').find('.panel-body');

    for (var i = 0; i < lists.length; i++) {
        if ($(lists[i]).attr('value') == id) {
            console.log('same');
            var done = $('.task_done', lists[i]);
            var star = $('.task_star', lists[i]);
            var time_limit = $('.task_day', lists[i]).text();
            var title = $('.task_title', lists[i]).text();
            console.log(title);
            $.ajax({
                type: 'PUT',
                url: '/api/1/todo/' + id,
                contentType: 'application/json',
                data: JSON.stringify(
                    {
                        "done": done.is(':checked'),
                        "star": !$(star).hasClass('glyphicon-star'),
                        "tag_ids": [
                            1
                        ],
                        "time_limit": time_limit,
                        "title": title
                    }),
                success: function (json) {
                    display();
                }
            });


            break;
        }
    }
}


/*削除ボタン*/
function clickDeleteBtn(id){
    $.ajax({
        type: 'DELETE',
        url: '/api/1/todo/' +  id,
        success: function (json) {
            display();
        }
    });
}


