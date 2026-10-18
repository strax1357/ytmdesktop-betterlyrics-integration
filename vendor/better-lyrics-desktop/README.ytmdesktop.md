# Better Lyrics desktop bundle

This folder is the unpacked Better Lyrics 3.0.0 Chrome release adapted to run inside YouTube Music Desktop App.

The unmodified release archive is `../better-lyrics-release-v3.0.0.zip` (downloaded from [the v3.0.0 release](https://github.com/better-lyrics/better-lyrics/releases/tag/v3.0.0)); its SHA-256 is:

```text
205a61f98c6081177ad1f94d9d6d588afa63ebda8477c21d15ffd2af2e2be216
```

The corresponding source and desktop-specific source changes are in [`../better-lyrics-source`](../better-lyrics-source), under Better Lyrics' GPL-3.0 license.

## Desktop changes

- Removed the Manifest V3 background service worker and browser toolbar action, which are not needed for the lyrics content scripts in Electron.
- Redirected `chrome.storage.sync` to `chrome.storage.local`, which Electron supports. Settings stay in this app's local profile and do not sync through a browser account.
- Added a small English `chrome.i18n.getMessage` fallback for Electron.
- Added a desktop settings page for selecting a translation language or defining rules based on the original lyric language. Translation itself remains controlled by the lyrics toolbar button.
- Replaced the nonfunctional picture-in-picture control with access to Better Lyrics settings.
- Routed Better Lyrics links to the system browser and its Unison submission page to an app window.
- Removed stale lyric footer actions when a track has no lyrics.
- Kept the official content scripts, styles, images, fonts, and localized resources intact.

The extension loads into the persistent YouTube Music session before `music.youtube.com` opens. The app's existing shaders are unchanged; Better Lyrics Shaders are not bundled.
