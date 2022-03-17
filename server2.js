const express = require("express");
const app = express();

const WebSocket = require('ws');
const wsServer = new WebSocket.Server({ port: 9000 });

const PORT = process.env.PORT || 3000
const jsonParser = express.json()
const fs = require('fs');

const {MongoClient} = require('mongodb')
const client = new MongoClient('mongodb+srv://kaelovek:letmekeepitsecret@cluster0.y4hpw.mongodb.net/memesituations?retryWrites=true&w=majority')

const { generatorCode } = require('./module_func')
const { different_nums } = require('./module_func')
const { rand_int } = require('./module_func')
const { generatorNotExist } = require('./module_func')
const { getAllDirPhotoFiles } = require('./module_func')
const { card_gen } = require('./module_func')
const { isRoomAlreadyExist } = require('./module_func')

const photo_dir = './page/images_library'
const collection_situations = 'situations'
const collection_rooms = 'rooms'
const allPictureFiles = getAllDirPhotoFiles(photo_dir,fs)

let rooms = []

function is_room_already_exist(rooms,room) {
    for (let value of rooms){
        if (value.room_name == room){
            return false
        }
    }
    return true
}

app.use(express.static(__dirname + "/page"));
app.post("/get_values",jsonParser, async function (request, response) {
    if (!request.body) return response.sendStatus(400);

    //console.log(request.body)

    await client.connect()

    //Тут надо будет на монго перенести, сам ебись
    if (is_room_already_exist(rooms,request.body.room_name)) {
        rooms.push(
            {
                room_name: request.body.room_name,
                players: [],
            }
        )
        console.log(rooms);
    }
    await client.db().collection(collection_situations).find({'id': {$in: different_nums(await client.db().collection(collection_situations).countDocuments(),request.body.sit_count,rand_int)}}).toArray(async (err, results) => {
        //console.log(results)
        //response.json(results);  //RESPONSE!!!

        var get_sit = ()=>{
            var data = []
            for (elment of results){
                data.push(elment.situation)
            }
            return data
        }

        var get_nicks = ()=>{
            return request.body.nicknames.split(',').slice(0,Number(request.body.player_count))
        }

        var get_roomCode = async ()=>{
            let code = await generatorNotExist(generatorCode,client,collection_rooms);
            await client.db().collection(collection_rooms).insertOne({code:code});
            return code
        }
        var answer = {
            room_code: await get_roomCode(),
            nicknames: await get_nicks(),
            situations: await get_sit(),
            cards: await card_gen(request.body.player_count,request.body.card_count,allPictureFiles,rand_int)
        }

        await response.json(answer);

    });


});

app.listen(PORT, () => console.log("Сервер работает"));


wsServer.on('connection', onConnect);

function onConnect(wsClient) {

    console.log('Новый пользователь');


    wsClient.on('close', function() {
        console.log('Пользователь отключился');
    });


    wsClient.on('message', function(message) {
        try {
            const jsonMessage = JSON.parse(message);
            switch (jsonMessage.action) {
                case 'connect_to_room':
                    if(!is_room_already_exist(rooms,jsonMessage.data)){
                        for (let value of rooms){
                            if (value.room_name == jsonMessage.data){
                                value.players.push(wsClient);
                                console.log(rooms);
                                wsClient.send(jsonMessage.data);
                            }
                        }
                    }
                    break;
                default:
                    console.log('Неизвестная команда');
                    break;
            }
        } catch (error) {
            console.log('Ошибка', error);
        }
    });
}

console.log('Вебсокет запущен на 9000 порту');