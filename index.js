//Load HTTP module
/*const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

//Create HTTP server and listen on port 3000 for requests
const server = http.createServer((req, res) => {

  //Set the response HTTP header with HTTP status and Content type
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

//listen for request on port 3000, and as a callback function have the port listened on logged
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});*/

const http = require('http');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000
const { Pool } = require('pg'); //PostgreSQL on Heroku
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
const shortHash = require('short-hash');

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Nothing to see here   :D');
});
/*
app.get('/:hash', (req, res) => {
    let inputHash = req.params["hash"];
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM url_table');
        if(result){
            for(let item in result.rows){
                if(shortHash(item["url"]) == inputHash){
                    res.redirect(item["url"]);
                    return;
                }
            }
        }
        client.release();
        res.send("Link not found! :(");
    } catch (err) {
        res.send("Database error! :(");
    }
});
*/

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

app.post('/', (req, res) => {
    let inputUrl = req.body["inputUrl"];
    let inputHash = shortHash(inputUrl);
    let isInTable = false;
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM url_table');
        if(result){
            for(let item in result.rows){
                if(shortHash(item["url"]) == inputHash){
                    isInTable = true;
                    break;
                }
            }
        }
        if(!isInTable){
            await client.query(`INSERT INTO url_table (url) VALUES ('${inputUrl}');`);
        }
        client.release();
    } catch (err) {
        res.json({
            validUrl: false,
            outputUrl:"Database error! :("
         });
    }
    res.json({
        validUrl:validURL(inputUrl),
        outputUrl:req.protocol + '://' + req.get('host') + "/" + inputHash
    });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${ PORT }`)
});