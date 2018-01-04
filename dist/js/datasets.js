$(function () {
    $(".result").dblclick(function () {
        $(this).html("");
    });
    $('.run').click(
        function () {
            var parent = $(this).parent();
            var textarea = parent.find("textarea");
            var result = parent.find(".result");
            var param = textarea.val();
            var method = parent.find(".method").text();
            var url = HOST_URL + $(this).text();
            var data = $(this).data("url");
            console.log('data', data);
            if (data)
                url = HOST_URL + data;
            console.log(url, method, param);
            textarea.toggleClass("expand");
            var json;
            try {
                if (param){
                    json = JSON.parse(param);
                    console.log(json);
                }
            } catch (e) {
                result.css("color", "red").html("<b>JSON parse error:\n</b>" + e);
                return;
            }
            result.css("color", "green").html("Please wait ...");
            $.ajax({
                type: method,
                url: url,
                data: JSON.stringify(json),
                contentType: "application/json",
                success: function (data) {
                    result.css("color", "black").html(JSON.stringify(data, null, 2));
                },
                failure: function (e) {
                    result.css("color", "red").html("<b>Error while request:\n</b>" + e);
                },
                error: function (request, status, e) {
                    result.css("color", "red").html("<b>Error while request:\n</b>" +
                        "status:" + status +
                        "\nerror:" + e +
                        "\nrequest:" + JSON.stringify(request, null, 2));
                }
            });
        });
});