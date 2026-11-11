import { app, BrowserWindow, dialog, session, shell } from "electron";
import log from "electron-log";
import path from "node:path";
import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

let extensionId: string | null = null;
let settingsWindow: BrowserWindow | null = null;
let unisonWindow: BrowserWindow | null = null;

function getYtmSession() {
  return session.fromPartition(app.isPackaged ? "persist:ytmview" : "persist:ytmview-dev");
}

export function openExternalHttps(urlString: string) {
  try {
    const url = new URL(urlString);
    if (url.protocol === "https:") void shell.openExternal(url.href);
    else log.warn(`Blocked non-HTTPS external URL ${urlString}`);
  } catch (error) {
    log.warn("Blocked invalid external URL", error);
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isOriginalAppRunning(): Promise<boolean | null> {
  let command: string;
  let args: string[];

  if (process.platform === "win32") {
    command = "tasklist";
    args = ["/FI", "IMAGENAME eq youtube-music-desktop-app.exe", "/FO", "CSV", "/NH"];
  } else if (process.platform === "darwin") {
    command = "pgrep";
    args = ["-f", "YouTube Music Desktop App"];
  } else {
    command = "pgrep";
    args = ["-f", "youtube-music-desktop-app"];
  }

  try {
    const { stdout } = await execFileAsync(command, args, { windowsHide: true });
    return process.platform === "win32" ? /youtube-music-desktop-app\.exe/i.test(stdout) : stdout.trim().length > 0;
  } catch (error) {
    if ((error as { code?: unknown }).code === 1) return false;
    log.warn("Could not check whether the original app is running", error);
    return null;
  }
}

/**
 * The fork has a different productName, so Electron gives it a separate userData folder.
 * Import only the original app's YTM session into that folder; leave the original untouched.
 *
 * Must run before the YTM session is first used. Returns false when the app is quitting.
 */
export async function migrateOriginalYtmProfile(): Promise<boolean> {
  if (!app.isPackaged) return true;

  const forkUserData = app.getPath("userData");
  const originalUserData = path.join(app.getPath("appData"), "YouTube Music Desktop App");
  if (path.resolve(forkUserData).toLowerCase() === path.resolve(originalUserData).toLowerCase()) return true;

  const migrationMarker = path.join(forkUserData, ".original-ytm-profile-migration");
  if (await pathExists(migrationMarker)) return true;

  const originalProfile = path.join(originalUserData, "Partitions", "ytmview");
  if (!(await pathExists(originalProfile))) return true;

  const response = await dialog.showMessageBox({
    type: "question",
    title: "Import YouTube Music data?",
    message: "An existing YouTube Music Desktop App profile was found.",
    detail:
      "Copy its YouTube Music session, sign-in, and Better Lyrics settings into this fork? The original profile will stay untouched. The fork will use its own copy. Close the original app before continuing.",
    buttons: ["Skip", "Copy profile"],
    defaultId: 0,
    cancelId: 0
  });

  if (response.response !== 1) {
    await fs.mkdir(forkUserData, { recursive: true });
    await fs.writeFile(migrationMarker, "skipped\n", "utf8");
    return true;
  }

  const originalAppRunning = await isOriginalAppRunning();
  if (originalAppRunning !== false) {
    await dialog.showMessageBox({
      type: "warning",
      title: "Close YouTube Music Desktop App first",
      message: "The original app must be fully closed before its profile can be copied.",
      detail: "Close it from its tray icon, then start this fork again. No profile data was changed.",
      buttons: ["OK"]
    });
    app.quit();
    return false;
  }

  const forkProfile = path.join(forkUserData, "Partitions", "ytmview");
  const partitionsFolder = path.dirname(forkProfile);
  const stagingProfile = path.join(partitionsFolder, `ytmview-import-${Date.now()}`);
  const backupProfile = path.join(partitionsFolder, `ytmview-before-import-${Date.now()}`);
  const disposableCaches = new Set(["Cache", "Code Cache", "DawnGraphiteCache", "DawnWebGPUCache", "GPUCache"]);

  try {
    await fs.mkdir(partitionsFolder, { recursive: true });
    await fs.cp(originalProfile, stagingProfile, {
      recursive: true,
      filter: sourcePath => {
        const relativePath = path.relative(originalProfile, sourcePath);
        const topLevelEntry = relativePath.split(path.sep)[0];
        return relativePath === "" || !disposableCaches.has(topLevelEntry);
      }
    });

    const hadExistingProfile = await pathExists(forkProfile);
    if (hadExistingProfile) await fs.rename(forkProfile, backupProfile);

    try {
      await fs.rename(stagingProfile, forkProfile);
    } catch (error) {
      if (hadExistingProfile) await fs.rename(backupProfile, forkProfile);
      throw error;
    }

    try {
      await fs.writeFile(migrationMarker, "copied\n", "utf8");
    } catch (error) {
      log.warn("Could not save the original-profile migration marker", error);
    }
    log.info("Copied the original YouTube Music session into the fork profile; original data was left untouched");
    return true;
  } catch (error) {
    log.error("Failed to import the original YouTube Music profile", error);
    await dialog.showMessageBox({
      type: "error",
      title: "Could not import YouTube Music data",
      message: "The original profile could not be copied. The original data was left untouched.",
      detail: "You can continue with a fresh YouTube Music profile and sign in again.",
      buttons: ["Continue"]
    });
    return true;
  }
}

/**
 * Loads the bundled Better Lyrics extension into the YTM session.
 * Must run before the YTM view is created so its document-start scripts are active.
 */
export async function loadBetterLyricsExtension(): Promise<void> {
  const extensionPath = app.isPackaged
    ? path.join(process.resourcesPath, "better-lyrics-desktop")
    : path.join(app.getAppPath(), "vendor", "better-lyrics-desktop");

  try {
    const extension = await getYtmSession().extensions.loadExtension(extensionPath);
    extensionId = extension.id;
    log.info(`Loaded Better Lyrics extension ${extension.name} (${extension.version})`);
  } catch (error) {
    log.error("Failed to load Better Lyrics extension", error);
  }
}

function createExtensionWindow(options: Electron.BrowserWindowConstructorOptions, devTools: boolean) {
  const window = new BrowserWindow({
    ...options,
    show: false,
    backgroundColor: "#181818",
    webPreferences: { session: getYtmSession(), sandbox: true, contextIsolation: true, devTools }
  });
  window.webContents.setWindowOpenHandler(details => {
    openExternalHttps(details.url);
    return { action: "deny" };
  });
  window.once("ready-to-show", () => window.show());
  return window;
}

export function openBetterLyricsSettingsWindow(parent: BrowserWindow | undefined, modal: boolean, devTools: boolean): void {
  if (!extensionId) return;
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  const safeParent = parent && !parent.isDestroyed() ? parent : undefined;
  settingsWindow = createExtensionWindow(
    {
      width: 520,
      height: 420,
      minWidth: 440,
      minHeight: 360,
      ...(safeParent ? { parent: safeParent, modal: modal && process.platform !== "darwin" } : {}),
      title: "Better Lyrics"
    },
    devTools
  );
  settingsWindow.once("closed", () => {
    settingsWindow = null;
  });
  void settingsWindow.loadURL(`chrome-extension://${extensionId}/desktop-settings.html`);
}

function isUnisonUrl(url: URL) {
  return url.protocol === "chrome-extension:" && url.hostname === extensionId && url.pathname === "/pages/unison.html";
}

/**
 * Handles window.open calls from the YTM view that target Better Lyrics' lyrics submission page.
 * Returns true when the request was handled.
 */
export function handleBetterLyricsWindowOpen(urlString: string, parent: BrowserWindow | undefined, devTools: boolean): boolean {
  if (!extensionId) return false;

  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }
  if (!isUnisonUrl(url)) return false;

  if (unisonWindow && !unisonWindow.isDestroyed()) {
    unisonWindow.focus();
    return true;
  }

  const safeParent = parent && !parent.isDestroyed() ? parent : undefined;
  unisonWindow = createExtensionWindow(
    {
      width: 1040,
      height: 780,
      minWidth: 720,
      minHeight: 560,
      ...(safeParent ? { parent: safeParent } : {}),
      title: "Submit lyrics · Better Lyrics"
    },
    devTools
  );
  unisonWindow.once("closed", () => {
    unisonWindow = null;
  });
  void unisonWindow.loadURL(url.href);
  return true;
}
