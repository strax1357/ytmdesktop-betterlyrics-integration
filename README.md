# YouTube Music Desktop App with Better Lyrics

This is a community fork of [YouTube Music Desktop App](https://github.com/ytmdesktop/ytmdesktop). It bundles [Better Lyrics](https://github.com/better-lyrics/better-lyrics) so that time-synced lyrics and translations work in the desktop app.

## What this fork adds

- Better Lyrics loads with the YouTube Music view.
- A desktop settings page lets you choose a translation language or define language rules. Rules are matched against the original lyrics, and “Other languages” remains the fallback.
- Better Lyrics links that need a browser or an app window are routed to the appropriate place.
- The app's existing shaders remain unchanged. Better Lyrics Shaders are not included.

Better Lyrics preferences are stored locally in the app's persistent YouTube Music profile. The language rules and default language are user settings; this repository does not set personal language preferences.

## Build and run

The normal YouTube Music Desktop App development setup applies. Use Node.js 20 and Yarn:

```sh
corepack enable
yarn install
yarn start
```

The packaged app includes `vendor/better-lyrics-desktop`. To create a distributable build, use the build instructions from the upstream project and ensure the Better Lyrics assets are present in that directory. See [`vendor/better-lyrics-desktop/README.ytmdesktop.md`](vendor/better-lyrics-desktop/README.ytmdesktop.md) for the bundled extension's source version and desktop changes.

## Upstream projects and licensing

This fork is not an official release of either upstream project. The YouTube Music Desktop App and Better Lyrics retain their respective GPL-3.0 licenses. Their license files and notices are included; see [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md). The `vendor/better-lyrics-source` directory contains the corresponding Better Lyrics source with this fork's desktop changes.

For the original app, see [ytmdesktop/ytmdesktop](https://github.com/ytmdesktop/ytmdesktop). For Better Lyrics, see [better-lyrics/better-lyrics](https://github.com/better-lyrics/better-lyrics).
