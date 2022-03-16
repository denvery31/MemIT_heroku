async function req_func(data_to_send,link) {
    let response = await fetch(link, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json;charset=utf-8'
        },
        body: JSON.stringify(data_to_send)
    });
    let result = await response.json();

    console.log(result);
}


function send_room_data(){
    let room_settings = {
        player_count: document.getElementById("player_count").value,
        card_count: document.getElementById("card_count").value,
        sit_count: document.getElementById("sit_count").value,
        nicknames: document.getElementById("nicknames").value,
        room_name: document.getElementById("room_name_to_send").value,
    };
    req_func(room_settings,"/get_values");
}

function connect_to_room(){
    let room_name = document.getElementById("room_name").value;
    const myWs = new WebSocket('ws://localhost:9000');


    myWs.onopen = function () {
        console.log('подключился');
        myWs.send(JSON.stringify({action: 'connect_to_room', data: room_name.toString()}));
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