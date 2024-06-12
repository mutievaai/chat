$(document).ready(function () { 
    const sender_id = $("#sender-id").val(); 
    let receiver_id; 
 
    const socket = io("/user-namespace", { 
        auth: { 
            token: sender_id, 
        }, 
    }); 
 
    $(".user-item").click(function () { 
        const userId = $(this).data("id"); 
        const userName = $(this).data("name"); 
        const userIcon = $(this).data("icon"); 
 
        // alert("User clicked:" + userId + ", " + userName + ", " + userIcon); 
 
        if (receiver_id === userId) { 
            $(".start-head").show(); 
            $(".chat-section").hide(); 
            receiver_id = null; 
            $(this).removeClass("active-user"); 
        } else { 
            receiver_id = userId; 
            $(".start-head").hide(); 
            $(".chat-section").show(); 
            $(".chat-user-link").attr("href", `/profile/${userId}`) 
            $(".chat-user-name").text(userName); 
            $(".chat-user-icon").attr("src", userIcon); 
            socket.emit("existsChat", { sender_id, receiver_id }); 
 
            $(".user-item").removeClass("active-user"); 
            $(this).addClass("active-user"); 
        } 
    }); 
 
    $("#chat-form").submit(function (event) { 
        event.preventDefault(); 
 
        const message = $("#message").val(); 
        if (!message) { 
            alert("Message cannot be empty"); 
            return; 
        } 
 
 
        $.ajax({ 
            url: "/save-chat", 
            type: "POST", 
            data: { sender_id, receiver_id, message }, 
            success: (response) => { 
                if (response.success) { 
                    $("#message").val(""); 
                    const chatHtml = `<div class="message current-user-chat"><h5>${response.data.message}</h5></div>`; 
                    $("#chat-container").append(chatHtml); 
                    socket.emit("newChat", response.data); 
                    scrollChat();  
                } else { 
                    alert(response.msg); 
                } 
            }, 
            error: (xhr, status, error) => { 
                console.error("Error sending message:", error); 
            }, 
 
        }); 
    }); 
 
    socket.on("loadNewChat", (data) => {
        // Only append the message if it is for the current chat
        if (sender_id === data.receiver_id && receiver_id === data.sender_id) { 
            const chatHtml = `<div class="message distance-user-chat"><h5>${data.message}</h5></div>`; 
            $("#chat-container").append(chatHtml);
            scrollChat();
        } 
    }); 
 
    socket.on("loadChats", (data) => { 
        $("#chat-container").html(""); 
        const chats = data.chats; 
        let chatHtml = ""; 
 
        chats.forEach((chat) => { 
            const chatClass = chat.sender_id === sender_id ? "current-user-chat" : "distance-user-chat"; 
            chatHtml += `<div class="message ${chatClass}"><h5>${chat.message}</h5></div>`; 
        }); 
        $("#chat-container").append(chatHtml); 
        scrollChat(); 
    }); 
     // Listen for online status
    socket.on("getOnlineUser", (data) => {
        const userItem = $(`.user-item[data-id="${data.user_id}"]`);
        if (userItem.length) {
        userItem.addClass("online");
        }
    });
 
    // Listen for offline status
    socket.on("getOfflineUser", (data) => {
        const userItem = $(`.user-item[data-id="${data.user_id}"]`);
        if (userItem.length) {
        userItem.removeClass("online");
        }
    });
 
    function scrollChat() { 
        $("#chat-container").animate({ scrollTop: $("#chat-container")[0].scrollHeight }, 0); 
    } 
});
