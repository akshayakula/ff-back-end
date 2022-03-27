const express = require('express')
const app = express()
var bodyParser = require('body-parser')
const port = 3000
var jsonParser = bodyParser.json()
const axios = require('axios')
const { Client, Intents } = require('discord.js')
const keys = require('./keys.json')
const command = require('./command')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let curr_link = ""

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

client.on('ready', (message) => {

    console.log('the client is ready')


    command(client, 'ping', message => {
        message.channel.send('Pong')
    })

    command(client, 'servers', message => {
        client.guilds.cache.forEach(guild => {
            message.channel.send(`${guild.name} has ${guild.memberCount} members`)
        })
    })

    // command(client, 'cc', message => {
    //     // if(message.member.hasPermission("ADMINISTRATOR")) {
    //        message.channel.messages.fetch().then(results => {
    //            message.channel.bulkDelete(results)
    //        }) 
    //     // }
    // })

    command(client, 'createtextchannel', message => {
        const content = message.content.replace("!createtextchannel ", '')
        console.log(message.guild.roles.everyone.id)

        message.guild.channels.create(content, {
            type: 'text',
            // permissionOverwrites: [
            //     {
            //         id: message.guild.id,
            //         allow: ["VIEW_CHANNEL"],
            //         deny: ["SEND_MESSAGES"]
            //    }
            //  ]
        }).then(channel => {
            // console.log(channel)
            message.channel.messages.fetch().then(results => {
                message.channel.bulkDelete(results)
            })
             
            channel.createInvite()
            .then(invite => {
                    console.log(`Created an invite with a code of ${invite}`)
                    curr_link = invite;
                })
            .catch(console.error);

        })


    })


})

app.get('/createChannel', async (req, res) => { 
    // client.guilds.channels.create('test', {
    //     type: 'GUILD_TEXT',
    //     permissionOverwrites: [{
    //         id: message.guild.id,
    //         allow: ['VIEW_CHANNEL'],
    //         deny: ['SEND_MESSAGES'],
    //     }]
    // });

    // client.guilds.channels.create("test", {type: 'text'}).then( ch => console.log(ch));


    console.log(client.guilds);
     
})


app.get('/sendAddress', jsonParser , async (req, res) => {


    let lat = req.body.lat;
    let lon = req.body.lon;
    let n_lat = parseFloat(lat) 
    let n_lon = parseFloat(lon)

    // n_lat = Math.round10(n_lat, 4)
    // n_lon = Math.round10(n_lon, 4)

    lat = n_lat.toFixed(4)
    lon = n_lon.toFixed(4)

    console.log(n_lat);
    console.log(n_lon);

    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=grocery&location=${lat}%2C${lon}&radius=5000&type=grocery store&key=${keys.google}`
    // console.log(url)
    let r = await axios.get(url);

    let nearest = r.data.results
    nearest = nearest.map(e =>  {
        return  {
                    name: e.name,
                    lat: e.geometry.location.lat,
                    lon: e.geometry.location.lng,
                    id: e.place_id
                }
    })

    console.log(nearest)

    const id_len = nearest.length > 3 ? 3 : nearest.length
    let special_id = "";
    for(let i =0; i < id_len; i++){
     special_id += nearest[i].id
    }

    console.log(special_id)

    let discord_hook = 'https://discord.com/api/webhooks/957498192004521994/ZS0ob9D6uDSchkFNQ76WeNitaENWsB2mjvHKK5P5gPKIhHzF-XPnmy4K9c_-IWKGjrky'

    axios.post(discord_hook, {
        content: `!createtextchannel ${special_id}`
    })

    await new Promise(r => setTimeout(r, 2000));

    res.send(`${curr_link}`);
})

client.login(keys.discord_bot_token)
