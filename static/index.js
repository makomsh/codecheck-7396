/**
 * Created by miyashita_ak on 17/01/20.
 */

console.log('index.js');
displayList();
$(document).on('click','#changeLists',function(){

    if(!$('#changeLists').data('done')){
        console.log(!$('#changeLists').attr('data-done'));
        $('#changeLists').attr('data-done','true');
        $.ajax({
            type: 'GET',
            url: '../api/1/todo/',
            success: function (json) {
                // 成功時の処理
                console.log(json);
                $('#board').empty();
                if (json.length != null) {
                    for (var i = 0; i < json.length; i++) {
                        if (json[i].done) {
                            var mess = "<p><input type='checkbox' liDone='" +json[i].done +"'>"  + json[i].title + "<input type='checkbox' liStar='" + json[i].star +"'></p>";
                            $('#board').append(mess);
                        }
                    }
                }
            }
        });
    }else{
        $('#changeLists').attr('data-done','false');
        displayList();
    }
});
//test押下時
$(document).on('click','#test', function() {
console.log('create');
//	console.log('comment'+ $('#message').val());
    console.log($('#deadline').val());
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
            displayList();
        }
    });

   // $('input[type="text"]').val('');
});

function displayList() {
    $.ajax({
        type: 'GET',
        url: '../api/1/todo/',
        success: function (json) {
            // 成功時の処理
            console.log(json);
            $('#board').empty();
            if (json.length != null) {
                for (var i = 0; i < json.length; i++) {
                    if (!json[i].done) {
                        var mess = "<p><input type='checkbox' class='l_done " +json[i].done +"'>";
                        mess += json[i].title;
                        mess += "<input type='checkbox' class='l_star " + json[i].star +"'></p>";
                        $('#board').append(mess);
                    }
                }
            }
        }
    });
}
