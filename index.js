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

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Nothing to see here   :D');
});

app.post('/', (req, res) => {
    data = req.body;
    /*
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM test_table');
        const results = { 'results': (result) ? result.rows : null};
        res.render('pages/db', results );
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
    */
   let responseJson = "Yay -> " + data["inputUrl"]
   res.json({a:responseJson});
});

app.listen(PORT, () => {
  console.log(`Listening on port ${ PORT }`)
});