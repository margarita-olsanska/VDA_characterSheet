
const DB_NAME = "vtmVaultDB"
const DB_VERSION = 3
const HANDLE_STORE = "handles"
const HANDLE_KEY = "charactersDir"
const CHAR_STORE = "characters"
const LIBRARY_STORE = "libraryPresets"

let dirHandle = null

let libraryDirHandle = null

function openDB(){

	return new Promise((resolve, reject) => {

		const req = indexedDB.open(DB_NAME, DB_VERSION)

		req.onupgradeneeded = () => {
			const db = req.result
			if(!db.objectStoreNames.contains(HANDLE_STORE)) db.createObjectStore(HANDLE_STORE)
			if(!db.objectStoreNames.contains(CHAR_STORE)) db.createObjectStore(CHAR_STORE)
			if(!db.objectStoreNames.contains(LIBRARY_STORE)) db.createObjectStore(LIBRARY_STORE)
		}

		req.onsuccess = () => resolve(req.result)
		req.onerror = () => reject(req.error)
	})
}

async function saveHandleToDB(handle){

	const db = await openDB()

	return new Promise((resolve, reject) => {
		const tx = db.transaction(HANDLE_STORE, "readwrite")
		tx.objectStore(HANDLE_STORE).put(handle, HANDLE_KEY)
		tx.oncomplete = resolve
		tx.onerror = () => reject(tx.error)
	})
}

async function loadHandleFromDB(){

	const db = await openDB()

	return new Promise((resolve, reject) => {
		const tx = db.transaction(HANDLE_STORE, "readonly")
		const req = tx.objectStore(HANDLE_STORE).get(HANDLE_KEY)
		req.onsuccess = () => resolve(req.result || null)
		req.onerror = () => reject(req.error)
	})
}

async function idbListCharacters(){

	const db = await openDB()

	return new Promise((resolve, reject) => {

		const tx = db.transaction(CHAR_STORE, "readonly")
		const store = tx.objectStore(CHAR_STORE)
		const keysReq = store.getAllKeys()
		const valuesReq = store.getAll()

		tx.oncomplete = () => resolve(keysReq.result.map((fileName, i) => ({ fileName, data: valuesReq.result[i] })))
		tx.onerror = () => reject(tx.error)
	})
}

async function idbReadCharacter(fileName){

	const db = await openDB()

	return new Promise((resolve, reject) => {
		const tx = db.transaction(CHAR_STORE, "readonly")
		const req = tx.objectStore(CHAR_STORE).get(fileName)
		req.onsuccess = () => resolve(req.result)
		req.onerror = () => reject(req.error)
	})
}

async function idbWriteCharacter(fileName, data){

	const db = await openDB()

	return new Promise((resolve, reject) => {
		const tx = db.transaction(CHAR_STORE, "readwrite")
		tx.objectStore(CHAR_STORE).put(data, fileName)
		tx.oncomplete = resolve
		tx.onerror = () => reject(tx.error)
	})
}

async function idbDeleteCharacter(fileName){

	const db = await openDB()

	return new Promise((resolve, reject) => {
		const tx = db.transaction(CHAR_STORE, "readwrite")
		tx.objectStore(CHAR_STORE).delete(fileName)
		tx.oncomplete = resolve
		tx.onerror = () => reject(tx.error)
	})
}

async function idbListLibraries(){

	const db = await openDB()

	return new Promise((resolve, reject) => {

		const tx = db.transaction(LIBRARY_STORE, "readonly")
		const store = tx.objectStore(LIBRARY_STORE)
		const keysReq = store.getAllKeys()
		const valuesReq = store.getAll()

		tx.oncomplete = () => resolve(keysReq.result.map((fileName, i) => ({ fileName, data: valuesReq.result[i] })))
		tx.onerror = () => reject(tx.error)
	})
}

async function idbReadLibrary(fileName){

	const db = await openDB()

	return new Promise((resolve, reject) => {
		const tx = db.transaction(LIBRARY_STORE, "readonly")
		const req = tx.objectStore(LIBRARY_STORE).get(fileName)
		req.onsuccess = () => resolve(req.result)
		req.onerror = () => reject(req.error)
	})
}

async function idbWriteLibrary(fileName, data){

	const db = await openDB()

	return new Promise((resolve, reject) => {
		const tx = db.transaction(LIBRARY_STORE, "readwrite")
		tx.objectStore(LIBRARY_STORE).put(data, fileName)
		tx.oncomplete = resolve
		tx.onerror = () => reject(tx.error)
	})
}

async function idbDeleteLibrary(fileName){

	const db = await openDB()

	return new Promise((resolve, reject) => {
		const tx = db.transaction(LIBRARY_STORE, "readwrite")
		tx.objectStore(LIBRARY_STORE).delete(fileName)
		tx.oncomplete = resolve
		tx.onerror = () => reject(tx.error)
	})
}

export function isFileSystemAccessSupported(){
	return typeof window.showDirectoryPicker === "function"
}

export function getVaultBackend(){
	return isFileSystemAccessSupported() ? "fs" : "indexeddb"
}

export function isVaultConnected(){
	return getVaultBackend() === "indexeddb" || dirHandle !== null
}

export async function tryReconnectVault(){

	if(getVaultBackend() !== "fs") return false

	const saved = await loadHandleFromDB().catch(() => null)
	if(!saved) return false

	const granted = await saved.queryPermission({ mode: "readwrite" }) === "granted"
	if(!granted) return false

	dirHandle = saved
	libraryDirHandle = null
	return true
}

export async function connectVault(){

	const handle = await window.showDirectoryPicker({ id: "vda-characters", mode: "readwrite" })

	const granted = await handle.requestPermission({ mode: "readwrite" })
	if(granted !== "granted") throw new Error("Permission denied")

	dirHandle = handle
	libraryDirHandle = null
	await saveHandleToDB(handle)
}

async function getLibraryDirHandle(){
	if(!libraryDirHandle) libraryDirHandle = await dirHandle.getDirectoryHandle("libraries", { create: true })
	return libraryDirHandle
}

export function characterFileName(character){

	const trimmed = (character.name || "").trim()
	const safe = (trimmed || "character").replace(/[\\/:*?"<>|]+/g, "_")

	return `${safe}.json`
}

export async function listVaultCharacters(){

	if(getVaultBackend() === "indexeddb"){

		const rows = await idbListCharacters()

		return rows
			.map(({ fileName, data }) => data && ({
				fileName,
				name: data.name || fileName.replace(/\.json$/, ""),
				portrait: data.portrait || null
			}))
			.filter(Boolean)
			.sort((a, b) => a.name.localeCompare(b.name))
	}

	const entries = []

	for await (const [fileName, handle] of dirHandle.entries()){

		if(handle.kind !== "file" || !fileName.endsWith(".json")) continue

		try{
			const file = await handle.getFile()
			const data = JSON.parse(await file.text())

			entries.push({
				fileName,
				name: data.name || fileName.replace(/\.json$/, ""),
				portrait: data.portrait || null
			})
		}catch(e){
		}
	}

	entries.sort((a, b) => a.name.localeCompare(b.name))

	return entries
}

export async function readVaultCharacterFile(fileName){

	if(getVaultBackend() === "indexeddb"){
		const data = await idbReadCharacter(fileName)
		return new File([JSON.stringify(data)], fileName, { type: "application/json" })
	}

	const handle = await dirHandle.getFileHandle(fileName)
	return handle.getFile()
}

export async function writeVaultCharacter(fileName, data){

	if(getVaultBackend() === "indexeddb"){
		await idbWriteCharacter(fileName, data)
		return
	}

	const handle = await dirHandle.getFileHandle(fileName, { create: true })
	const writable = await handle.createWritable()

	await writable.write(JSON.stringify(data, null, 2))
	await writable.close()
}

export async function deleteVaultCharacter(fileName){

	if(getVaultBackend() === "indexeddb"){
		await idbDeleteCharacter(fileName)
		return
	}

	await dirHandle.removeEntry(fileName)
}


export async function listVaultLibraries(){

	if(getVaultBackend() === "indexeddb"){

		const rows = await idbListLibraries()

		return rows
			.map(({ fileName, data }) => data && ({
				fileName,
				name: data._name || fileName.replace(/\.json$/, "")
			}))
			.filter(Boolean)
			.sort((a, b) => a.name.localeCompare(b.name))
	}

	const dir = await getLibraryDirHandle()
	const entries = []

	for await (const [fileName, handle] of dir.entries()){

		if(handle.kind !== "file" || !fileName.endsWith(".json")) continue

		try{
			const file = await handle.getFile()
			const data = JSON.parse(await file.text())

			entries.push({ fileName, name: data._name || fileName.replace(/\.json$/, "") })
		}catch(e){
		}
	}

	entries.sort((a, b) => a.name.localeCompare(b.name))

	return entries
}

export async function readVaultLibraryFile(fileName){

	if(getVaultBackend() === "indexeddb"){
		const data = await idbReadLibrary(fileName)
		return new File([JSON.stringify(data)], fileName, { type: "application/json" })
	}

	const dir = await getLibraryDirHandle()
	const handle = await dir.getFileHandle(fileName)
	return handle.getFile()
}

export async function writeVaultLibrary(fileName, data){

	if(getVaultBackend() === "indexeddb"){
		await idbWriteLibrary(fileName, data)
		return
	}

	const dir = await getLibraryDirHandle()
	const handle = await dir.getFileHandle(fileName, { create: true })
	const writable = await handle.createWritable()

	await writable.write(JSON.stringify(data, null, 2))
	await writable.close()
}

export async function deleteVaultLibraryFile(fileName){

	if(getVaultBackend() === "indexeddb"){
		await idbDeleteLibrary(fileName)
		return
	}

	const dir = await getLibraryDirHandle()
	await dir.removeEntry(fileName)
}

export function fileToPortraitDataUrl(file, maxDim = 400){

	return new Promise((resolve, reject) => {

		const reader = new FileReader()

		reader.onerror = () => reject(reader.error)

		reader.onload = () => {

			const img = new Image()

			img.onerror = reject

			img.onload = () => {

				const scale = Math.min(1, maxDim / Math.max(img.width, img.height))

				const canvas = document.createElement("canvas")
				canvas.width = Math.round(img.width * scale)
				canvas.height = Math.round(img.height * scale)

				canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height)

				resolve(canvas.toDataURL("image/jpeg", 0.85))
			}

			img.src = reader.result
		}

		reader.readAsDataURL(file)
	})
}
