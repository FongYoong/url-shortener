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
    res.send('Nothing to see here :D');
});

app.get('/:hash', async (req, res) => {
    let inputHash = req.params["hash"];
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM url_table');
        if(result){
            for(let item of result.rows){
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

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

app.post('/', async (req, res) => {
    let inputUrl = req.body["inputUrl"];
    let inputHash = shortHash(inputUrl);
    let isInTable = false;
    if(validURL(inputUrl)){
        try {
            const client = await pool.connect()
            const result = await client.query('SELECT * FROM url_table');
            if(result){
                for(let item of result.rows){
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
             console.log("HOHO: "+ err);
        }
        res.json({
            validUrl:true,
            outputUrl:req.protocol + '://' + req.get('host') + "/" + inputHash
        });
    }
    else{
        res.json({
            validUrl:false,
            outputUrl:"Invalid URL! :("
        });
    }
    
});

app.listen(PORT, () => {
  console.log(`Listening on port ${ PORT }`)
});