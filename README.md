# LaneKind

A small vehicle feedback demo built with HTML, CSS and vanilla JavaScript. Look up a license plate and state, read its profile, and save a constructive comment after your trip.

## Preview locally

With Node.js installed, open a terminal in this folder and run:

```sh
node server.mjs
```

Open http://127.0.0.1:4173. No install or build is required. Opening `index.html` directly from disk cannot load the JSON data in most browsers; use the preview server or GitHub Pages.

## Sample vehicles

| Plate | State | Notes |
| --- | --- | --- |
| DJP8094 | NY | Requested example; no invented vehicle details or incidents. |
| DEMO123 | CA | Fictional test vehicle with a sample thank-you. |
| TEST456 | TX | Fictional test vehicle with a constructive sample note. |

`data/vehicles.json` is the vehicle data file. Plate and state together identify a profile. Spaces and hyphens are ignored, and plates are normalized to uppercase. The demo accepts 1–8 ASCII letters or numbers; special plate symbols and international plates are outside this prototype. The form includes all 50 states and Washington, DC. An unknown plate gets a profile when its first comment is saved.

## How saving works

- Comments are stored in `localStorage` under `lanekind-comments-v1` on the visitor's browser and site origin. They survive reloads on that browser, but do not sync to other browsers, devices or visitors.
- Private browsing, blocked storage, storage limits or clearing browser data may prevent or erase saves. The UI reports save failures and preserves the typed comment.
- **Download vehicle data** exports seed profiles plus local comments to `vehicles.json`. This downloads a new file; it does not overwrite the repository automatically.
- To keep a reviewed snapshot in GitHub, inspect the downloaded file, replace `data/vehicles.json` with it, and commit it. All comments in the committed file become public site content. Local comments with matching IDs are not duplicated after a snapshot is published.
- Visitors can delete comments they saved locally. Comments already included in the published data file must be edited by the repository owner.
- JSON and comment strings are rendered as text, never as HTML. Loading/saving failures and empty profiles have visible messages.

GitHub Pages is static hosting. Automatic shared persistence requires a backend API and database or an authenticated server that can write a file. Never place a GitHub token in browser code. A public shared version would also need server-side validation, abuse controls, moderation and a correction/removal process. This demo contains no shared server or identity verification.

## Publish on GitHub Pages

1. Create a GitHub repository called `lanekind` (or choose another name). Public repositories can use GitHub Pages on GitHub Free.
2. Upload the following site files, preserving the `data` folder: `index.html`, `styles.css`, `app.js`, `favicon.svg`, `data/vehicles.json`, and `.nojekyll`. Add this README and `server.mjs` if you want the local preview instructions too.
3. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
4. Wait for GitHub to publish, then open the site URL shown in Pages settings. For a repository named `lanekind`, it normally follows `https://YOUR-USERNAME.github.io/lanekind/`.

All assets use relative paths so repository subpaths work. Internet access to Google Fonts provides DM Sans and Manrope; the site falls back to Segoe UI/system sans-serif when fonts are unavailable. No analytics or location collection is included.

## Safe use and scope

The form requires a confirmation that the trip is over and the visitor is safely parked. This is a reminder, not motion detection or a technical guarantee. Unchecking it hides the active profile. There are no driving notifications, plate scanning, maps, leaderboards or driver-identification features. Sample notes are explicitly labeled; a plate does not establish who was driving. Proposed public-use safeguards and the business hypothesis are discussed in the accompanying Word draft.

## Files

- `index.html` — page structure and accessible forms
- `styles.css` — blue palette, typography and responsive layout
- `app.js` — lookup, profiles, comments, local saving and data export
- `data/vehicles.json` — seed vehicle records and sample comments
- `server.mjs` — local static preview only, not a comment backend

## Reference

[GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
