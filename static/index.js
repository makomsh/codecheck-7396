/*
 * Created by miyashita_ak on 17/01/20.
 */


var Page = function(){

    //初期化
    this.init = function(){
        $('#createNew').hide();
        changeMode("sort_non");
        display();


        $( "#deadline" ).datepicker();
        $( "#deadline" ).datepicker( "option", "dateFormat", "yy-mm-dd" );
        $( "#show_deadline" ).datepicker();
        $( "#show_deadline" ).datepicker( "option", "dateFormat", "yy-mm-dd" );

    };

};

var p = new Page();
var array =[];
$(function(){
    p.init();
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
});

/*
 * TODOLISTを表示する関数
 * 引数：なし
 * 返り値：なし
 * */
function display() {
    $.ajax({
        type: 'GET',
        url: '../api/1/todo/',
        success: function (json) {
            // 成功時の処理;
            $('#sort_mode').removeClass('sorted');
            setLists(json);
            changeDisplay();
        }
    });
}

/*
 * TODOLISTをセットする（changeDisplayにてモードに応じて表示切替）
 * 引数：TODOLIST一覧
 * 返り値：なし
 * */
function setLists(arrayList) {
    $('#sortable').empty();
    for (var i = 0; i < arrayList.length; i++) {
        var mess = "<div class='panel panel-default todo'>";
        mess += " <div class='panel-body' value='" + arrayList[i].id + "'>";
        mess += "<input type='checkbox' class='todo_done' onclick='clickCheckBtn("+ arrayList[i].id +")' ";
        if (arrayList[i].done) {
            mess += "checked";
        }
        mess += ">";
        mess += "<a class='todo_title' onclick='showDetailTodo("+ arrayList[i].id +")'>";
        mess += arrayList[i].title;
        mess += "</a>";
        mess += "<span class='todo_star glyphicon glyphicon-star";
        if (!arrayList[i].star) {
            mess += "-empty";
        }
        mess += "'></span>";
        mess += "<div class='t_time'>";
        mess += "<span class='glyphicon'>&#xe023;</span>";
        if (arrayList[i].time_limit != null) {

            mess += "<span class='todo_day'>";
            mess += arrayList[i].time_limit;
            mess += "</span>";

            var lim = calTime(arrayList[i].time_limit);
            if (lim == 0) {
                mess += "<span class='todo_time_limit today'>今日</span>";
            } else if (!arrayList[i].done) {
                if (lim < 0) {
                    mess += "<span class='todo_time_limit over'>期限が過ぎています！</span>";
                } else {
                    mess += "<span class='todo_time_limit'>あと" + lim + "日</span>";
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

/*
 *締め切り日まであと何日か計算するメソッド
 * 引数：締め切り日
 * 返り値：締め切り日までの日数
 * */
function calTime(time){
    var end = new Date(time);
    var now = new Date();
    var day = Math.floor((end.getTime() - now.getTime())/(60*60*24*1000))+1;
    return day;
}

/*
 * 表示の仕方に応じて表示を変更するためのメソッド
 * 締め切り日の場合：
 *   すべてのTODOLISTを読み込みなおし、未完了のみ時間ごとにソート（締め切り日がない場合は下に表示）
 * すべて表示：TODOLISTの要素をすべて表示
 * それ以外：モードに応じてそれぞれの要素を表示・非表示する
 * 引数：なし
 * 返り値：なし
 */
function changeDisplay() {

    var mode = $('#sort_mode').attr('mode');
    var lists = $('#board').find('.panel-body');
    if (mode != "sort_deadline") {
        for (var i = 0; i < lists.length; i++) {
            var d = $('.todo_done', lists[i]);
            var s = $('.todo_star', lists[i]);
            var t = $('.todo_day', lists[i]);
            var listParent = $(lists[i]).parent(".panel");
            if (mode == "sort_done") {
                if (d.is(':checked')) {
                    listParent.show();
                } else {
                    listParent.hide();
                }
            } else if (mode == 'sort_non') {
                if (!d.is(':checked')) {
                    listParent.show();
                } else {
                    listParent.hide();
                }
            } else if (mode == "sort_star") {
                if ($(s).hasClass('glyphicon-star')) {
                    if(!d.is(':checked'))
                        listParent.show();
                    else
                        listParent.hide();
                } else {
                    listParent.hide();
                }
            }
        }
    } else if(!$('#sort_mode').hasClass('sorted')){
        $.ajax({
            type: 'GET',
            url: '../api/1/todo/',
            success: function (json) {
                // 成功時の処理;
                var array=[];
                for(var i = 0; i < json.length; i++){
                    if(!json[i].done){
                        array.push(json[i]);
                    }
                }
                array.sort(function(a,b){
                    if(a.time_limit == null) return 1; //nullは下へ
                    if(a.time_limit < b.time_limit) return -1;
                    if(a.time_limit > b.time_limit) return 1;

                    return 0;
                });
                $('#sort_mode').addClass('sorted');
                setLists(array);
            }
        });
    }
}


/*
 *表示の仕方を変更するためのメソッド
 * 前のモードをまず求めておく
 * モードを新しいものに設定
 * 前の並び方のボタンをdefaultに
 * 切り替える並び方のボタンをprimaryに
 * 引数：並び替えるモード
 * 返り値：なし
 * */
function changeMode(mode) {

    var before = $('#sort_mode').attr('mode');
    $('#sort_mode').attr('mode', mode);
    $('#' + before).toggleClass('btn-primary');
    $('#' + before).toggleClass('btn-default');
    $('#' + mode).toggleClass('btn-primary');
    $('#' + mode).toggleClass('btn-default');

    if(mode == "all" || before == "sort_deadline"){
        display();
    }
}

/*
 * 並び替えボタンが押された時のイベント
 * １．モードの変更
 * ２．再表示
 * 引数：並び替える方法（モード）
 * 返り値：なし
 * */
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
    $('#sort_mode').removeClass('sorted');
    changeMode("sort_deadline");
    changeDisplay();
});


/*
 *新しいタスクを作成するためのモーダル用ボタンのイベント
 * ＋New TO DO　が押された時はモーダルを表示
 * X　Canselが押された時はモーダルを非表示
 * */
$(document).on('click','#createBtn',function() {


    var w = $(window).width();
    var h = $(window).height();

    var cw = $("#createNew").outerWidth();
    var ch = $("#createNew").outerHeight();

    //取得した値をcssに追加する
    $("#createNew").css({
        "left": ((w - cw)/2) + "px",
        "top": ((h - ch)/2) + "px"
    });
    $('#createNew').show();
});

$(document).on('click','#cansel',function() {
    $('#createNew').hide();
});

$(document).on('click','.close',function() {
    $('#createNew').hide();
});

/*
 * 新しいTODOを追加するためのメソッド
 * それぞれの情報をデータベースに格納
 * ＊カテゴリは０、Stringに設定
 * 表示したあとはモーダル非表示
 * */
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

/*それぞれのTodoないのボタンのイベント*/
/*完了・未完了きりかえ*/
function clickCheckBtn(id){
    var lists = $('#board').find('.panel-body');
    for (var i = 0; i < lists.length; i++) {
        if ( $(lists[i]).attr('value') == id ) {
            var done = $('.todo_done', lists[i]);
            var star = $('.todo_star', lists[i]);
            var time_limit = $('.todo_day', lists[i]).text();
            var title = $('.todo_title', lists[i]).text();
            $.ajax({
                type: 'PUT',
                url: '/api/1/todo/' + id,
                contentType: 'application/json',
                data: JSON.stringify(
                    {
                        "done": done.is(':checked'),
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

function clickDoneBtn(id) {
    var lists = $('#board').find('.panel-body');
    for (var i = 0; i < lists.length; i++) {
        if ( $(lists[i]).attr('value') == id ) {
            var done = $('.todo_done', lists[i]);
            var star = $('.todo_star', lists[i]);
            var time_limit = $('.todo_day', lists[i]).text();
            var title = $('.todo_title', lists[i]).text();
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
            var done = $('.todo_done', lists[i]);
            var star = $('.todo_star', lists[i]);
            var time_limit = $('.todo_day', lists[i]).text();
            var title = $('.todo_title', lists[i]).text();
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

/*
 *詳細表示＋編集のモーダル用ボタンのイベント
 * タイトルが押された時はモーダルを表示
 * X　Canselが押された時はモーダルを非表示
 * */

$(document).on('click','#close',function() {
    closeDetail();

});

$(document).on('click','.close',function() {
    closeDetail();
});

function closeDetail(){
    $('#edit').text('Edit');
    if($('#edit').hasClass('btn-danger')){
        $('#edit').toggleClass('btn-primary');
        $('#edit').toggleClass('btn-danger');
    }
    $('#show_todo').prop('disabled', true);
    $('#show_deadline').prop('disabled', true);
    $('#show_done').prop('disabled', true);
    $('#show_star').prop('disabled', true);
    display();
    $('#showDetail').hide();

}

/*
 * モーダルにTODOの詳細を設定し、表示するメソッド
 * それぞれの要素にテキストを代入していく
 * 引数；TODOLISTのid
 * 返り値：なし
 * */
function showDetailTodo(id) {

    var lists = $('#board').find('.panel-body');
    for (var i = 0; i < lists.length; i++) {
        if ($(lists[i]).attr('value') == id) {
            var done = $('.todo_done', lists[i]);
            var star = $('.todo_star', lists[i]).hasClass('glyphicon-star');
            var time_limit = $('.todo_day', lists[i]).text();
            var title = $('.todo_title', lists[i]).text();

            $('#show_id').text("#"+id);
            $('#show_id').attr('value', id);
            $('#show_todo').text(title);
            $('#show_todo').attr('value',title);
            if(time_limit != null){
                $("#show_deadline").datepicker("setDate", time_limit);
            }

            if(done.is(':checked'))
                $('#show_done').prop('checked',true);
            else
                $('#show_done').prop('checked',false);
            if(star)
                $('#show_star').prop('checked',true);
            else
                $('#show_star').prop('checked',false);
        }
    }
    $('#showDetail').show();
}


/*
 * タスクを編集するためのメソッド
 * */
$(document).on('click','#edit', function() {
    if( $('#edit').text() == "Edit" ){
        $('#show_todo').prop('disabled', false);
        $('#show_deadline').prop('disabled', false);
        $('#show_done').prop('disabled', false);
        $('#show_star').prop('disabled', false);
        $('#edit').text('Save');
        $('#edit').toggleClass('btn-primary');
        $('#edit').toggleClass('btn-danger');
    }else{
        var id = $('#show_id').text();
        $.ajax({
            type: 'PUT',
            url: '/api/1/todo/' + id.replace('#',''),
            contentType: 'application/json',
            data: JSON.stringify(
                {
                    "done": $('#show_done').prop("checked"),
                    "star": $('#show_star').prop("checked"),
                    "tag_ids": [
                        1
                    ],
                    "time_limit": $('#show_deadline').val(),
                    "title": $('#show_todo').val()
                }),
            success: function (json) {
                $('#edit').text('Edit');
                $('#edit').toggleClass('btn-primary');
                $('#edit').toggleClass('btn-danger');
                $('#show_todo').prop('disabled', true);
                $('#show_deadline').prop('disabled', true);
                $('#show_done').prop('disabled', true);
                $('#show_star').prop('disabled', true);
                display();
            }
        });
    }
});



/**/



