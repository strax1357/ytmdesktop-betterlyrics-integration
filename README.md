# YTMD Better Lyrics (Community Fork)

This is an unofficial community fork of [YouTube Music Desktop App](https://github.com/ytmdesktop/ytmdesktop), maintained independently by [Strax1357](https://github.com/strax1357). It bundles [Better Lyrics](https://github.com/better-lyrics/better-lyrics) so that time-synced lyrics and translations work in the desktop app. It is not made, maintained, or endorsed by the upstream app authors, Better Lyrics authors, or Google.

The installed app uses a separate community-fork name and update feed, so it can be distinguished from the upstream app and will not update from the upstream release channel.

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

Credits: the original desktop app is by the [YTMD team and contributors](https://github.com/ytmdesktop/ytmdesktop); the lyrics extension is by the [Better Lyrics team and contributors](https://github.com/better-lyrics/better-lyrics). This fork keeps their license and copyright notices and maintains its desktop integration separately.

## Releases

Fork releases use their own version number, installer identity, update feed, and GitHub Releases page. The publish workflow creates a draft release so its installers and notes can be reviewed before publication. See [`RELEASING.md`](RELEASING.md) for the release steps and [`RELEASE-NOTES-TEMPLATE.md`](RELEASE-NOTES-TEMPLATE.md) for attribution and license text to include with a release.
