$(document).ready(function () {
    const sender_id = $("#sender-id").val();
    let receiver_id;

    const socket = io("/user-namespace", {
        auth: {
            token: sender_id,
        },
    });

    $(".user-list").click(function () {
        const userId = $(this).data("id");

        if (receiver_id === userId) {
            $(".start-head").show();
            $(".chat-section").hide();
            receiver_id = null;
        } else {
            receiver_id = userId;
            $(".start-head").hide();
            $(".chat-section").show();
            socket.emit("existsChat", { sender_id, receiver_id });
        }
    });

    $("#chat-form").submit(function (event) {
        event.preventDefault();

        const message = $("#message").val();

        $.ajax({
            url: "/save-chat",
            type: "POST",
            data: { sender_id, receiver_id, message },
            success: (response) => {
                if (response.success) {
                    $("#message").val("");
                    const chatHtml = `<div class="current-user-chat"><h5>${response.data.message}</h5></div>`;
                    $("#chat-container").append(chatHtml);
                    socket.emit("newChat", response.data);
                } else {
                    alert(response.msg);
                }
            },
        });
    });

    socket.on("loadNewChat", (data) => {
        if (sender_id === data.receiver_id && receiver_id === data.sender_id) {
            const chatHtml = `<div class="distance-user-chat"><h5>${data.message}</h5></div>`;
            $("#chat-container").append(chatHtml);
        }
    });

    socket.on("loadChats", (data) => {
        $("#chat-container").html("");
        const chats = data.chats;
        let chatHtml = "";

        chats.forEach((chat) => {
            const chatClass = chat.sender_id === sender_id ? "current-user-chat" : "distance-user-chat";
            chatHtml += `<div class="${chatClass}"><h5>${chat.message}</h5></div>`;
        });

        $("#chat-container").append(chatHtml);
        scrollChat();
    });

    function scrollChat() {
        $("#chat-container").animate({ scrollTop: $("#chat-container")[0].scrollHeight }, 0);
    }
});
