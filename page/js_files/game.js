async function req_func(data_to_send, link) {
    let response = await fetch(link, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data_to_send)
    });
    let result = await response.json();

    console.log(result);
}

function send_room_data() {
    let room_settings = {
        player_count: document.getElementById("player_count").value,
        card_count: document.getElementById("card_count").value,
        sit_count: document.getElementById("sit_count").value,
    };
    req_func(room_settings, "/get_values");
    vueApp.goToConnection();
}

function connect_to_room() {
    let room_name = document.getElementById("room_name").value;
    let player_name = document.getElementById("player_name").value;

    const myWs = new WebSocket('ws://localhost:9000');


    myWs.onopen = function () {
        myWs.send(JSON.stringify({ action: 'connect_to_room', code: room_name.toString(), name: player_name.toString() }));
    };


    myWs.onmessage = function (message) {
        switch (message.data) {
            case "New Connection":
                alert(message.data);
                break;
            default:
                console.log('connected to:', message.data);
                break;

        }
    };
}