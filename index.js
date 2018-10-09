#!/usr/bin/env node

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = 3000;


app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.post('/', (req, res) => {
    const {chunkName, files} = req.body;

    res.send(`Start loading ${chunkName}`);

    loadFiles({chunkName, files})
        .catch(console.error);
});

// TODO make chunkName optional
async function loadFiles({chunkName, files}) {
    let i = 0;

    console.log(`total files: ${files.length}`);

    await createChunkFolder(chunkName);

    for (const file of files) {
        await loadFile(file, chunkName, ++i);
    }

    console.log(`${chunkName} loading finished. ${files.length} files loaded`)
}

function createChunkFolder(chunkName) {
    return new Promise((resolve, reject) => {
        const mkdirp = require('mkdirp');
        mkdirp(chunkName, function (err) {
            if (err) return reject(err);
            else  {
                resolve()
            }
        });
    })
}

async function loadFile(link, chunkName, i) {
    const url = require('url');
    const parsedUrl = url.parse(link);

    const fileName = parsedUrl.pathname.split('/').pop();

    const path = chunkName + '\\' + fileName;

    await loadByLink(link, path);
    console.log(`File: ${i}. ${fileName} loaded`);
}

function loadByLink(link, path) {
    return new Promise((resolve, reject) => {
        const https = require('https');
        const fs = require('fs');

        const file = fs.createWriteStream(path);
        https.get(link, function (response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close();
            });
            response.on('end', () => {
                resolve();
            });
        }).on('error', function(err) { // Handle errors
            fs.unlink(path); // Delete the file async. (But we don't check the result)
            console.error(err.message);
            resolve();// go to next file
        });
    })
}




app.listen(port, () => console.log(`Example app listening on port ${port}!`));