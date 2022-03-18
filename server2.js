const express = require("express");
const app = express();

const WebSocket = require('ws');
const wsServer = new WebSocket.Server({ port: 9000 });

const PORT = process.env.PORT || 3000
const jsonParser = express.json()
const fs = require('fs');

const { MongoClient } = require('mongodb')
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
const allPictureFiles = getAllDirPhotoFiles(photo_dir, fs)

let rooms = []

function is_room_already_exist(rooms, room) {
    for (let value of rooms) {
        if (value.room_name == room) {
            return false
        }
    }
    return true
}
client.connect()
app.use(express.static(__dirname + "/page"));
app.post("/get_values", jsonParser, async function (request, response) {
    if (!request.body) return response.sendStatus(400);

    new Promise(async (resolve, reject) => {
        // get random situations \\ send them
        const answ = (data) => {
            var dataToReturn = []
            for (sit of data) {
                dataToReturn.push(sit.situation)
            }
            return dataToReturn
        }
        //await client.connect()
        await client.db().collection(collection_situations).find({ 'id': { $in: different_nums(await client.db().collection(collection_situations).countDocuments(), request.body.sit_count, rand_int) } }).toArray(async (err, results) => {

            resolve(await answ(results))
        });
    }).then(async (data) => {
        //create all data object \\ send it
        return new Promise(async (resolve, reject) => {

            const room_creation = async () => {
                return {
                    code: await generatorNotExist(code_length, generatorCode, client, collection_rooms),
                    playersCount: Number(request.body.player_count),
                    players: [],
                    situations: data,
                    cards: await card_gen(request.body.player_count, request.body.card_count, allPictureFiles, rand_int)
                }
            }
            resolve(await room_creation())
        })
    }).then(async (data) => {
        client.db().collection(collection_rooms).insertOne(data)
        console.log(data)
        response.json(data)
    })

})
app.listen(PORT, () => console.log("Сервер работает"));


wsServer.on('connection', onConnect);

function onConnect(wsClient) {

    console.log('Новый пользователь');


    wsClient.on('close', function () {
        console.log('Пользователь отключился');
    });


    wsClient.on('message', function (message) {
        try {
            const jsonMessage = JSON.parse(message);
            switch (jsonMessage.action) {
                case 'connect_to_room':
                    // let roomVariants = async ()=>{
                    //     await client.
                    //     // switch ('a'){

                    //     // }    
                    // }
                    //roomVariants()
                    // jsonMessage.code --> room id
                    // jsonMessage.name --> p name

                    //wsClient --> add

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