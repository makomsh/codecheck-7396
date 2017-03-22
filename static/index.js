/*
 * Created by miyashita_ak on 17/01/20.
 */

var Page = function(){
    //初期化
    this.init = function(){
        /*新しいTODO作成用ボタンイベント*/
        $("#createBtn").click( $.proxy(this.createNewOpen,this) );
        $("#cansel").click( $.proxy(this.createNewClose,this) );
        $(".close").click( $.proxy(this.createNewClose,this) );
        /*詳細・編集用ボタンイベント*/
        $("#create").click( $.proxy(this.createTodo,this) );
        $('#edit').click( $.proxy(this.editTodo,this) );
        $("#close").click( $.proxy(this.DetailClose,this) );
        $(".close").click( $.proxy(this.DetailClose,this) );
        /*表示変更用ボタンイベント*/
        $("#all").click( $.proxy(this.changeMode,this,'all') );
        $("#sort_non").click( $.proxy(this.changeMode,this,'sort_non') );
        $("#sort_done").click( $.proxy(this.changeMode,this,'sort_done') );
        $("#sort_star").click( $.proxy(this.changeMode,this,'sort_star') );
        $("#sort_deadline").click( $.proxy(this.changeMode,this,'sort_deadline') );
    };
    /*新しいタスクを作成するためのモーダル表示のメソッド */
    this.createNewOpen = function (){
        $('#createNew').show();
    }

    /*新しいTodoを作成するモーダルを閉じるためのメソッド*/
    this.createNewClose = function (){
        $('#createNew').hide();
    }

    /*
     * モーダルを非表示用メソッド
     * 編集されている場合があるので、一応再表示
     * モーダルを非表示に
     * ＋
     * 編集のモードの状態でモーダルを閉じる場合があるので
     * 状態を把握して、次開いたときに詳細表示モードになるように設定
     *
     * 引数：なし
     * 返り値なし
     * */
    this.DetailClose = function (){
        $('#edit').text('Edit');
        if($('#edit').hasClass('btn-danger')){
            $('#edit').toggleClass('btn-primary');
            $('#edit').toggleClass('btn-danger');
        }
        $('#show_todo').prop('disabled', true);
        $('#show_deadline').prop('disabled', true);
        $('#show_done').prop('disabled', true);
        $('#show_star').prop('disabled', true);
        $('#showDetail').hide();
    }

    /*
     *表示の仕方を変更するためのメソッド
     * 前のモードをまず求めておく
     * モードを新しいものに設定
     * 前の並び方のボタンをdefaultに
     * 切り替える並び方のボタンをprimaryに
     * 設定が完了したら、再表示
     * 引数：並び替えるモード
     * 返り値：なし
     * */
    this.changeMode = function(mode) {
        var before = $('#sort_mode').attr('mode');
        $('#sort_mode').attr('mode', mode);
        $('#' + before).toggleClass('btn-primary');
        $('#' + before).toggleClass('btn-default');
        $('#' + mode).toggleClass('btn-primary');
        $('#' + mode).toggleClass('btn-default');

        if(mode == "all" || before == "sort_deadline"){
            display();
        }else if(mode == "sort_deadline"){
            $('#sort_mode').removeClass('sorted');
        }
        changeDisplay();
    }


    /*
     * 新しいTODOを追加するためのメソッド
     * それぞれの情報をデータベースに格納
     * ＊カテゴリは０、Stringに設定
     * 表示したあとはモーダル非表示
     * */
    this.createTodo = function(mode) {
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
    }

    /*
     * タスクを編集するためのメソッド
     * */
    this.editTodo = function() {
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
                    $("#close").click();
                }
            });
        }
    }

};

var p = new Page();

$(function(){
    p.init();
    $('#createNew').hide();
    $("#sort_non").click();
    display();
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
    $( "#deadline" ).datepicker();
    $( "#deadline" ).datepicker( "option", "dateFormat", "yy-mm-dd" );
    $( "#show_deadline" ).datepicker();
    $( "#show_deadline" ).datepicker( "option", "dateFormat", "yy-mm-dd" );
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
            remaindTime();
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
        mess += "<a class='btn btn_trash pull-right trash' onclick='clickDeleteBtn(" + arrayList[i].id + ")'><span class='glyphicon glyphicon-trash'>Trash</span></a>";
        mess += "<a class='btn btn_star pull-right star' onclick='clickStarBtn(" + arrayList[i].id + ")'><span class='glyphicon glyphicon-star";
        if (arrayList[i].star) {
            mess += "-empty'>Star</span></a>";
        } else {
            mess += "'>Star</span></a>";
        }
        mess += "<a class='btn btn_done pull-right done' onclick='clickDoneBtn("+ arrayList[i].id +")'><span class='glyphicon glyphicon-";
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
 * 通知を表示するためのメソッド
 *  期限が過ぎているTodoがあればその旨を通知　＋　並び替え
 *  本日締め切りのTodoがあればその旨を通知　＋　並び替え
 *  近日（5日以内）に締め切りのものがあれば通知
 *  上記の通知はある分だけ通知。
 *  何もなければコメント「今日も一日頑張りましょう！」
 * 引数：なし
 * 返り値：なし
 * */
function remaindTime(){
    $('#remaind').empty();
    var mess = "";
    var array = [];
    var count_over = 0;
    var count_today = 0;
    var count_few = 0;
    var lists = $('#board').find('.todo');
    for (var i = 0; i < lists.length; i++) {
        var done = $('.todo_done', lists[i]);
        if (!done.is(':checked')) {
            var time = $('.todo_time_limit', lists[i]);
            if ($(time).hasClass('over')) {
                count_over++;
                array.push(lists[i]);
            } else if ($(time).hasClass('today')) {
                count_today++;
                array.push(lists[i]);
            } else if ($(time).text() != null) {
                var days = parseInt($(time).text().replace('あと', '').replace('日', ''), 10);
                if(days <= 5){
                    count_few++;
                }
            }
        }
    }

    /*メッセージ通知*/
    if(count_over > 0){
        mess += "<a>期限が過ぎているTodoが"+count_over+"件あります。</a><br>";
    }
    if(count_today > 0){
        mess += "<a>本日締め切りのTodoが"+count_today+"件あります。</a><br>";
    }
    if(count_few > 0){
        mess += "<a>近日締め切りのTodoが"+count_few+"件あります。</a>";
    }
    if(count_over == 0 && count_today == 0 && count_few == 0){
        mess += "<a>今日も頑張っていきましょう！</a>";
    }

    if(count_over > 0){
        $('#remaind_panel').addClass("over");
        if($('#remaind_panel').hasClass('today')){
            $('#remaind_panel').removeClass('today');
        }
    }else if(count_today > 0){
        $('#remaind_panel').addClass("today");
        if($('#remaind_panel').hasClass('over')) {
            $('#remaind_panel').removeClass('over');
        }
    }else{
        if($('#remaind_panel').hasClass('over')) {
            $('#remaind_panel').removeClass('over');
        }
        if($('#remaind_panel').hasClass('today')){
            $('#remaind_panel').removeClass('today');
        }
    }

    $('#remaind').append(mess);

    /*並び替え*/
    array.sort(function(a,b){
        if($(a).find('.todo_day').text() > $(b).find('.todo_day').text()) return -1;
        if($(a).find('.todo_day').text() < $(b).find('.todo_day').text()) return 1;
        return 1;
    });

    for(var i = 0; i < array.length; i++){
        $(array[i]).prependTo('#sortable');
    }

}
