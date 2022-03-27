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
var cors = require('cors');
const { application } = require('express')
app.use(cors());
// app.use(express.static('public'))
let curr_link = ""

app.listen(port, () => {
  console.log(`Example app listening at ${keys.local_url}:${port}`)
})

app.use(express.static('./public'))


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


    res.send('hi')
     
})


app.post('/sendAddress', jsonParser , async (req, res) => {


    let lat = req.body.lat;
    let lon = req.body.lon;
    console.log(req.body)
    console.log(lon)

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

    let payload = {
        link: `${curr_link}`,
        points: nearest
    }

    res.send(payload);
})

client.login(keys.discord_bot_token)

// ## Inspiration

// Being college students in a town with poor public transportation and no car has made us realize the impact of food accessibility to our health. Always low on time and options it just becomes much easier to reach for long lasting unhealthy options that can be stocked up on (ex. Ramen, Chips). After dealing with this issue for two years, my neighbors and I developed a system of getting groceries that allows me to ride along with them and shop healthy options weekly.

// ## What it does

// FoodFyte is a community and community building platform. Simply input your address with autocomplete and we'll create and link you to a discord channel specially designed to optimize time. Community channels will have multiple grocery stores in a common vicinity if they are in a food rich region, and will have at least 1 in food desert areas.

// ## How we built it
 
// The application consists of 3 components. Users first reach the landing page front end vanilla javascript web-page. Google Api is ingrates into the web-page for auto complete and coordinate data. Vanilla JS was chosen for its significant performance (Very extreme difference) from react npm packages for the same purpose. The web-page interfaces with a Node.js backend thats uses discord.js and discord web hooks to interact with the discord server.

// ## Challenges we ran into

// One of the biggest challenges was interfacing with Discord API. We had to exploit discord bot's privileges and trigger them with a message which could be sent through a web hook, in order to link the node to the discord. Another challenge was performance with the google maps auto complete on the front end. Of course we also had lots of adjustments with the front end and making sure it was responsive and bug free for an array of screen sizes.


// ## Accomplishments that we're proud of

// We are very proud of the level of polishing we put into the front end and the overall performance and responsiveness. It was a huge thing for us to have a project that is already ready to help build communities, so that our users can add value to each other.

// ## What we learned

// ## What's next for FoodFyte

