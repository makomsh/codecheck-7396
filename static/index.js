/**
 * Created by miyashita_ak on 17/01/20.
 */

console.log("index.js");
displayList();



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
                        var mess = '<p>' + json[i].title + '</p>';
                        $('#board').append(mess);
                    }
                }
            }
        }
    });
}
