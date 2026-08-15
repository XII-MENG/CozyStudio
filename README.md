# My Bruce App Store Data

A free, self-hosted alternative to the official [BruceDevices/App-Store-Data](https://github.com/BruceDevices/App-Store-Data).

This repository contains the catalog and metadata for a personal Bruce App Store.  
You can host it on GitHub for free and use it with a modified `App Store.js`.

## Features

- Same structure as the official App-Store-Data
- Categories + minified category files
- Full `metadata.json` for each app
- Example apps included
- Completely free (MIT License)

## Repository Structure

```
bruce-appstore-data/
├── LICENSE
├── README.md
├── categories.json
├── supported-devices.json
├── releases/
│   ├── category-tools.min.json
│   ├── category-utilities.min.json
│   └── category-themes.min.json
├── repositories/
│   └── YOUR_USERNAME/
│       └── example-apps/
│           ├── Hello World/
│           │   ├── metadata.json
│           │   └── Hello World.js
│           └── Device Info/
│               ├── metadata.json
│               └── Device Info.js
└── apps/                          # optional convenience copies
    ├── Hello World.js
    └── Device Info.js
```

## How to use with your own App Store

1. **Fork / create this repository** on GitHub (make it public).
2. Replace every `YOUR_USERNAME` with your real GitHub username.
3. Update the commit hashes in the `metadata.json` files after you push (optional but recommended).
4. Use the companion `App Store.js` (included in this repo or the one below) and change the `BASE_URL` to:

```js
var BASE_URL = "https://raw.githubusercontent.com/YOUR_USERNAME/bruce-appstore-data/main";
```

5. Put the modified `App Store.js` on your Bruce device and run it.

### Expected API endpoints (served by raw GitHub)

| Endpoint | Description |
|----------|-------------|
| `/categories.json` | List of categories |
| `/releases/category-{slug}.min.json` | Apps in a category |
| `/repositories/{owner}/{repo}/{App Name}/metadata.json` | Full metadata |

## Adding a new app

1. Create a folder:
   ```
   repositories/YOUR_USERNAME/your-repo-name/Your App Name/
   ```

2. Put inside it:
   - `metadata.json` (see example below)
   - Your `.js` file(s)
   - (optional) `logo.png` (64×64 to 512×512 square PNG)

3. Update `categories.json` and the corresponding `releases/category-*.min.json`.

4. Commit & push.

### Example `metadata.json`

```json
{
  "name": "My Cool App",
  "description": "What this app does",
  "category": "Tools",
  "version": "1.0.0",
  "commit": "abcdef1234567890abcdef1234567890abcdef12",
  "owner": "YOUR_USERNAME",
  "repo": "your-repo-name",
  "path": "/",
  "files": [
    "My Cool App.js"
  ]
}
```

### Valid categories

- Audio
- Bluetooth
- Games
- GPIO
- Infrared
- Media
- RFID
- RF
- Themes
- Tools
- USB
- Utilities
- WiFi

## Updating an existing app

1. Change the source code.
2. Bump the `version` (must be higher).
3. Update the `commit` field to the new SHA.
4. Update the corresponding entry in `releases/category-*.min.json`.
5. Push.

## License

MIT – free for personal and commercial use.
