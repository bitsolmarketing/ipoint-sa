# Deploying ipointapple to Hostinger (hPanel) — File Manager + MySQL

A ready-to-upload bundle has been built for you:

> **`C:\Users\Amna\Downloads\ipointapple-hostinger.zip`**
> Contains the full app + `vendor/` + built front-end assets. Excludes `node_modules`,
> the local SQLite DB, and dev caches — so **nothing needs to be built on the server**.
> It extracts to a single folder: `ipointapple/`.

Requires **PHP 8.2+** (set in hPanel → **Advanced → PHP Configuration**).
Good news: this app writes uploads to `public/uploads/` directly, so **`storage:link` is NOT required**.

---

## Step 1 — Create the MySQL database
hPanel → **Databases → Management** → create a database + user (Hostinger links them automatically).
Copy the **database name, user, password** (host is `localhost`). You'll paste these in Step 4.

## Step 2 — Upload & extract the bundle
1. hPanel → **Files → File Manager**.
2. Go to your domain's home, e.g. `~/domains/<your-domain>/`.
3. **Upload** `ipointapple-hostinger.zip`, then right-click → **Extract**.
   You now have `~/domains/<your-domain>/ipointapple/`.

## Step 3 — Make the site serve Laravel's `public/`
Hostinger serves the domain from `public_html/`, but Laravel serves from `public/`. Pick one:

- **A. Point the document root (cleanest).** hPanel → **Websites → (your site) → Dashboard →
  Advanced → “Change website's root directory”** and set it to
  `domains/<your-domain>/ipointapple/public`. Done — skip to Step 4.

- **B. Symlink (if you have SSH).**
  ```bash
  cd ~/domains/<your-domain>
  rm -rf public_html && ln -s ipointapple/public public_html
  ```

- **C. No-SSH, can't change root.** Move the **contents** of `ipointapple/public/` into
  `public_html/` (including `.htaccess` and the `build/`, `uploads/` folders), then open
  `public_html/index.php` and change the two paths to point up into the app:
  ```php
  require __DIR__.'/../ipointapple/vendor/autoload.php';
  $app = require_once __DIR__.'/../ipointapple/bootstrap/app.php';
  ```
  With this option, product-image uploads land in `ipointapple/public/uploads/` — either also
  point them at `public_html/uploads/`, or prefer option A instead.

## Step 4 — Create `.env`
In File Manager, inside `ipointapple/`, rename **`.env.hostinger.example`** to **`.env`**
(enable “show hidden files”). Edit it and set:
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` from Step 1
- `APP_URL=https://<your-domain>`
- (`APP_KEY` is already filled in; keep `APP_DEBUG=false`)

## Step 5 — Create the tables (migrate + seed) — no SSH required
A one-time setup runner is already built into the app (`routes/web.php`). It stays **disabled (404)**
until you give it a secret token, so it is safe to ship.

1. In `.env`, set `SETUP_TOKEN` to a long random string (40+ chars), e.g. `SETUP_TOKEN=9x2f...random...`.
2. In a browser, visit **once**:
   `https://<your-domain>/__setup/<that-same-string>?seed=1`
   You'll see plain-text output of the migration + seed (offers, repair locations, refurbished iPhones).
3. **Immediately** blank it back out in `.env` → `SETUP_TOKEN=` (this re-disables the route).

Flags: `?seed=1` migrates **and** seeds demo data · `?fresh=1` wipes and reseeds from scratch
(destructive — only for a clean redo) · no flag = migrate only.

> Security: the route 404s whenever `SETUP_TOKEN` is empty and uses a constant-time token check.
> Leaving `SETUP_TOKEN` blank after setup fully disables it; deleting the block in `routes/web.php`
> removes it entirely.

*(If you later get SSH, the equivalent is `php artisan migrate --force --seed`.)*

## Step 6 — Permissions
Make these writable (File Manager → right-click → Permissions → `775`, or `chmod -R 775`):
`ipointapple/storage`, `ipointapple/bootstrap/cache`, `ipointapple/public/uploads`.

**Also create and chmod the persistent media folder**, one level *above* `ipointapple/` (i.e. a
sibling of it, inside `~/domains/<your-domain>/`): create a folder named **`media`** there and set
it to `775` too. Product/Banner/Offer image uploads try this folder **first** (it survives future
redeploys, unlike `public/uploads` which gets replaced when you re-upload the bundle) and only fall
back to `public/uploads` if it isn't writable. If uploads fail in the admin panel after deployment,
this is the first thing to check — the upload error message now states which exact path it tried
and couldn't write to.

## Step 7 — Verify
- Home page shows the **Latest Offers** carousel + category shelves.
- `/apple-product-repair` renders and the booking form submits.
- `/compare` works; **Add to Compare** on a product bumps the header count.
- `/admin` login `admin@ipointapple.com` / `Password123!` — **change this password immediately**.
- Confirm `APP_DEBUG=false` and that no Laravel error pages leak stack traces.

## Redeploying later
Re-upload changed files via File Manager. If you changed JSX, run `npm run build` locally and
upload the new `public/build/`. If dependencies changed, re-zip with a fresh `vendor/`. Then:
`php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan view:cache`.
