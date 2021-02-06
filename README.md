To install :
intall node/npm then `npm i` on folder.

In VS Code, add https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave and then add
```json
        "commands": [
            {
                "match": "mow\\.ts$",
                "isAsync": true,
                "cmd": "npm run build:ts"
            },
            {
                "match": "mow\\.scss$",
                "isAsync": true,
                "cmd": "npm run build:scss"
            }
        ]
    }
```

Also add auto-FTP upload (for example https://marketplace.visualstudio.com/items?itemName=lukasz-wronski.ftp-sync) and configure it.

Make sure ftp-sync.json and node_modules are in .gitignore