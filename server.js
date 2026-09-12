// tiny zero-dependency static file server, so the sheet can be opened over
// http://localhost instead of file:// - needed because:
//   1. browsers refuse to load ES modules (import/export) from file://
//   2. the File System Access API (Vault/Library "connect a folder") only
//      works in a secure context (https or localhost), never file://
// just plain Node.js builtins - nothing to npm install.
const http = require("http")
const fs = require("fs")
const path = require("path")

const PORT = process.env.PORT || 5500
const ROOT = __dirname

const MIME_TYPES = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2"
}

const server = http.createServer((req, res) => {

	// strip query string, decode %20 etc, default "/" to the sheet itself
	let urlPath = decodeURIComponent(req.url.split("?")[0])
	if(urlPath === "/") urlPath = "/char-sheet.html"

	// resolve against ROOT and refuse anything that escapes it (e.g. "/../../etc/passwd") -
	// path.relative + checking for a leading ".." catches this correctly on every OS,
	// unlike a plain startsWith(ROOT) check (which a sibling folder sharing ROOT's name
	// as a prefix could slip past)
	const filePath = path.join(ROOT, urlPath)
	const relative = path.relative(ROOT, filePath)

	if(relative.startsWith("..") || path.isAbsolute(relative)){
		res.writeHead(403)
		res.end("Forbidden")
		return
	}

	fs.readFile(filePath, (err, data) => {

		if(err){
			res.writeHead(404)
			res.end("Not found")
			return
		}

		const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream"

		res.writeHead(200, { "Content-Type": contentType })
		res.end(data)
	})
})

server.listen(PORT, "localhost", () => {
	console.log(`VTM character sheet running at http://localhost:${PORT}/`)
	console.log("Leave this window open while using the sheet. Close it to stop the server.")
})
