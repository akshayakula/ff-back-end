const express = require('express')
const app = express()
var bodyParser = require('body-parser')
const port = 3000
var jsonParser = bodyParser.json()
const axios = require('axios')
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/sendAddress', jsonParser , async (req, res) => {
    console.log(req.body.lat);
    console.log(req.body.lon);

    const lat = req.body.lat;
    const lon = req.body.lon;

    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=grocery&location=${lat}%2C${lon}&radius=2000&type=grocery store&key=AIzaSyBpO5EgoPIVnVww1-KIYlvXnl9_HEGikzo`
    // console.log(url)
    let r = await axios.get(url);


    let nearest = r.data.results
    nearest = nearest.map(e =>  {
        return  {
                    name: e.name,
                    lat: e.geometry.location.lat,
                    lon: e.geometry.location.lng
                }
    })

    console.log(nearest)


    res.send('done');
})
