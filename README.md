# Ryause Official Site

**Live:** <https://skidderiumx.github.io/Ryause-Official-Site/>

The official landing page for **Ryause**, a free Minecraft 1.8.9 Forge client built from
Raven B4 u20.

The site is plain HTML, CSS and JavaScript with no build step and no dependencies. It can be
served by GitHub Pages, Codeberg Pages, Cloudflare Pages, or any static host.

## Layout

```
index.html              landing page
404.html                not-found page
robots.txt
assets/
    favicon.svg
    css/style.css       design tokens and all site styles
    css/tour.css        scoped .u247 client-tour card
    js/site.js          profile loading, navigation, copy buttons
    js/tour.js          scroll-to-fill client-tour behaviour
    img/gui.png         ClickGUI screenshot
```

## Local preview

Opening `index.html` from disk works, but the profile list needs HTTP (the browser blocks
`fetch` for `file://` URLs). Serve the folder instead:

```powershell
python -m http.server 3000
# then open http://localhost:3000
```

Any static server works. There is nothing to compile.

## Profiles

The profile cards are read at runtime from the separate
[Ryause-Official-Profiles](https://github.com/SkidderiumX/Ryause-Official-Profiles) repository:

1. `index.json` is fetched from `raw.githubusercontent.com`.
2. If raw is unreachable, the same file is fetched from jsDelivr.
3. Each card links to the raw profile JSON so it can be downloaded directly.

The repository and branch are constants at the top of `assets/js/site.js`:

```js
var PROFILES_REPO = "SkidderiumX/Ryause-Official-Profiles";
var BRANCH = "main";
```

To add or edit a profile, change the profile repository — this site picks it up on the next
load. Nothing here needs to be redeployed.

## Client tour card

The `#features` section opens with the scroll-to-fill “Client tour” card (`.u247`), placed
between the section heading and the feature grid. It is self-contained:

- styles live in `assets/css/tour.css` and are scoped to `.u247`;
- behaviour lives in `assets/js/tour.js`;
- the card is 300 × 480 px and scrolls its own content;
- the video grows from 186 × 132 to 276 × 228 over the first 260 px of that scroll;
- at 92 % of the range it switches to playing, the caption rises, and the 92-second
  progress bar starts;
- scrolling back up pauses it and shrinks the video again.

The scroll area is a real focusable region, so keyboard users can Tab to it and use the
arrow keys, Page Up/Down, Home and End. With `prefers-reduced-motion: reduce`, the video,
caption and status still change, but the background drift and progress animation stop.
The theme is dark-only, so the `.u247` tokens map to the site's existing dark variables.

The poster is the real ClickGUI screenshot at `assets/img/gui.png`. Replace it with a video
still if one is recorded; the component keeps the same motion values.

## Editing

| What | Where |
| --- | --- |
| Copy, sections, FAQ | `index.html` |
| Colours, spacing, typography | `:root` in `assets/css/style.css` |
| Client tour card | `assets/css/tour.css`, `assets/js/tour.js` |
| Profile repository, refresh behaviour | `assets/js/site.js` |
| Client download link | `#download` in `index.html` |
| Screenshot | `assets/img/gui.png` |

Design tokens follow the client's ClickGUI palette: `--blue: #189aff`, `--purple: #7c5cff`,
with a dark `#070a10` background.

## Deploying with GitHub Pages

```powershell
git remote add origin https://github.com/SkidderiumX/Ryause-Official-Site.git
git push -u origin main
```

Then in the repository: **Settings → Pages → Build and deployment → Deploy from a branch →
`main` / `(root)`**. The site is published at `https://skidderiumx.github.io/Ryause-Official-Site/`.

Because the site lives at a subpath on `github.io`, keep asset links relative (they are).
`404.html` is fully self-contained so it renders correctly from any path.

## Credits

Ryause is built on the work of Chef, Sande, Abusez and Mega. Not affiliated with Mojang
Studios or Microsoft.
