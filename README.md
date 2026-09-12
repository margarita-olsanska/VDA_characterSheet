# VDA_characterSheet
Interactive character sheet for Tabletop RPG Vampire the Masquerade: Dark Ages

## Running it locally

- **Windows:** double-click `start.bat` - nothing to install, it uses PowerShell (already built into Windows).
- **macOS/Linux:** run `./start.sh` - uses Python 3 if it's installed (it almost always already is); falls back to Node.js if not.

Either one starts a tiny local server and opens the sheet at `http://localhost:5500/` in your browser. Leave the server window open while using the sheet; closing it stops the server.

Opening `char-sheet.html` directly (double-clicking the file) won't work - browsers block both ES module loading and the Vault/Library "connect a folder" feature over `file://`. A local server (even just `localhost`, no internet needed) is required for the app to work correctly.
