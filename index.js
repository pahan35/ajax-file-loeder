#!/usr/bin/env node

const bodyParser = require('body-parser')
const express = require('express')
const {promisify} = require('util')
const mkdirp = require('mkdirp')
const makeDir = promisify(mkdirp)

function normalizePort(val) {
  const port = parseInt(val, 10)

  if (Number.isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

const app = express()

const port = normalizePort(process.env.AFL_PORT || '3035')

app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  }),
)

app.post('/', (req, res) => {
  const {chunkName, files} = req.body

  res.send(`Start loading ${chunkName}`)

  loadFiles({chunkName, files}).catch(console.error)
})

// TODO make chunkName optional
async function loadFiles({chunkName, files}) {
  let i = 0

  console.log(`total files: ${files.length}`)

  await createChunkFolder(chunkName)

  for (const file of files) {
    await loadFile(file, chunkName, ++i)
  }

  console.log(`${chunkName} loading finished. ${files.length} files loaded`)
}

async function createChunkFolder(chunkName) {
  await makeDir(chunkName)
}

async function loadFile(link, chunkName, i) {
  const path = require('path')
  const url = require('url')
  const parsedUrl = url.parse(link)

  const fileName = parsedUrl.pathname.split('/').pop()

  const filePath = chunkName + path.sep + fileName

  await loadByLink(link, filePath)
  console.log(`File: ${i}. ${fileName} loaded`)
}

function loadByLink(link, path) {
  return new Promise((resolve, reject) => {
    const https = require('https')
    const fs = require('fs')

    const file = fs.createWriteStream(path)
    https
      .get(link, response => {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
        })
        response.on('end', () => {
          resolve()
        })
      })
      .on('error', err => {
        // Handle errors
        fs.unlink(path) // Delete the file async. (But we don't check the result)
        console.error(err.message)
        resolve() // go to next file
      })
  })
}

app.listen(port, () =>
  console.log(`Ajax file loader listening on port ${port}!`),
)
