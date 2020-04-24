## Motivation

I collected URLs to download in browser, but I noticed that it's impossible to download them without copy-pasting.
Copy-pasting was quite inconvenient because each page contained dynamic list of URLs.
To resolve this problem I decided to send this list via request to local endpoint.

Unfortunately I haven't found such packages in NPM which allows to do it.
Due to this reason I decided to create mine. 

## How to use?

1. Install this package globally
```shell script
    npm i -g ajax-file-loader
```

2. Start it in folder where you want to store downloaded files

```shell script
    ajax-file-loader
```

This action will open new Express server on port 3035.

Notice: you can use your own port using `AFL_PORT` env var
```shell script
export AFL_PORT=4205
```

Hint: you can start package using alias `afl`.
You also can setup package port only for current run
```shell script
AFL_PORT=4205 afl
```

3. When you have a running server, you need to send request with URLs to download.

Request must be in the next format
```shell script
curl --location --request POST 'http://localhost:3035' \
--header 'content-type: application/json' \
--data-raw '{"chunkName":"folder-to-save","files":["https://site.domain/file.to.download"]}'
```

Or same from browser
```javascript
fetch('http://localhost:3035', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body:
    JSON.stringify({
      chunkName:"folder-to-save",
      files:["https://site.domain/file.to.download"]
    })
})
```

I hope it's enough

Feel free to ask question and make your proposal for improvements on Github


