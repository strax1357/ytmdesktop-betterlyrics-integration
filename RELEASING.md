# Releasing this fork

This repository publishes its own community builds. Do not publish them as releases of `ytmdesktop/ytmdesktop` or `better-lyrics/better-lyrics`.

## First release: v2.0.13

The app package version is `2.0.13`. The tag must match it with the `v` prefix because the GitHub publisher uses that prefix. The release workflow is set to create a **draft** release with generated notes; it does not make a release public automatically.

After the code is ready and the build workflow succeeds:

1. Push the release-ready `development` branch to this repository.
2. Create and push the matching tag:

   ```sh
   git switch development
   git pull
   git tag v2.0.13
   git push origin v2.0.13
   ```

3. Open the repository's **Actions** tab and wait for **Application Publish** to finish successfully on every platform.
4. Open **Releases** and review the draft. Check the Windows Setup installer and the Linux/macOS assets, then use [`RELEASE-NOTES-TEMPLATE.md`](RELEASE-NOTES-TEMPLATE.md) to add the fork disclaimer, credits, and source/license links.
5. Publish the draft only after that review.

The Windows installer is built with Squirrel.Windows. The release should include its Setup `.exe` and related update files. The workflow also builds Linux `.deb`/`.rpm` and macOS `.zip` assets. Exact platform availability depends on every workflow job succeeding.

The app identity is intentionally different from the upstream app so both can be installed separately. This also means the fork uses its own app settings folder; settings from the upstream app are not automatically shared.

The repository does not currently configure a Windows code-signing certificate. The installer can still be built and distributed, but Windows may label it as an unrecognized publisher. Code signing is optional for GPL compliance and requires a certificate held by the publisher.

## GitHub Actions setup

The publish workflow targets this fork directly and requests only `contents: write`, which Electron Forge needs to create a GitHub release. It uses GitHub's automatically provided `GITHUB_TOKEN`; no personal access token or repository variable is needed. In **Settings → Actions → General → Workflow permissions**, allow the workflow to write repository contents if GitHub's default is read-only.

The publisher creates a draft first, generates release notes, and can replace same-named assets if a failed upload needs to be retried. Do not create a tag until the release commit, package version, and build workflow are ready; pushing any `v*` tag starts the release workflow.

## Source and licenses

The source for each release is the tagged source tree, which includes the app, the desktop Better Lyrics adaptation, and both projects' license files. Keep the upstream copyright and license notices intact. Link the exact source tag and license information in the published notes. The app and Better Lyrics are both distributed under GPL-3.0; this repository does not replace their licenses with a new one.
