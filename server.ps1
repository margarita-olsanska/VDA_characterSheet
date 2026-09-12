# tiny zero-dependency static file server for Windows - uses only what
# PowerShell already ships with, so no separate install (Node, Python, ...)
# is needed. See README.md for why a server is required at all instead of
# just opening char-sheet.html directly (file:// blocks ES modules and the
# Vault/Library "connect a folder" feature).
$port = 5500
$root = (Get-Item $PSScriptRoot).FullName

$mimeTypes = @{
	".html"  = "text/html; charset=utf-8"
	".js"    = "text/javascript; charset=utf-8"
	".css"   = "text/css; charset=utf-8"
	".json"  = "application/json; charset=utf-8"
	".png"   = "image/png"
	".jpg"   = "image/jpeg"
	".jpeg"  = "image/jpeg"
	".svg"   = "image/svg+xml"
	".ico"   = "image/x-icon"
	".woff"  = "font/woff"
	".woff2" = "font/woff2"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try{
	$listener.Start()
}catch{
	Write-Host "Couldn't start the server on port $port - is it already in use?"
	Write-Host $_.Exception.Message
	pause
	exit 1
}

Write-Host "VTM character sheet running at http://localhost:$port/"
Write-Host "Leave this window open while using the sheet. Close it (or Ctrl+C) to stop."

while($listener.IsListening){

	$context = $listener.GetContext()
	$request = $context.Request
	$response = $context.Response

	try{
		$urlPath = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
		if($urlPath -eq "/"){ $urlPath = "/char-sheet.html" }

		$candidate = Join-Path $root ($urlPath.TrimStart("/") -replace "/", "\")
		$fullPath = [System.IO.Path]::GetFullPath($candidate)

		# refuse anything that escapes $root (e.g. "/../../secrets.txt")
		if(-not $fullPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)){
			$response.StatusCode = 403
			$response.Close()
			continue
		}

		if(-not (Test-Path $fullPath -PathType Leaf)){
			$response.StatusCode = 404
			$response.Close()
			continue
		}

		$bytes = [System.IO.File]::ReadAllBytes($fullPath)
		$ext = [System.IO.Path]::GetExtension($fullPath).ToLower()

		$response.ContentType = if($mimeTypes.ContainsKey($ext)){ $mimeTypes[$ext] } else { "application/octet-stream" }
		$response.ContentLength64 = $bytes.Length
		$response.OutputStream.Write($bytes, 0, $bytes.Length)
	}catch{
		$response.StatusCode = 500
	}finally{
		$response.Close()
	}
}
