import { character } from "./character.js"
import { importCharacterFromFile, exportCharacterToFile, buildCharacterExportData } from "./storage.js"
import { t } from "./i18n.js"
import {
	getVaultBackend, isVaultConnected, tryReconnectVault, connectVault,
	listVaultCharacters, readVaultCharacterFile, writeVaultCharacter,
	deleteVaultCharacter, characterFileName, fileToPortraitDataUrl
} from "./vault.js"

function createVaultCard(entry, { onOpen, onChanged }){

	const card = document.createElement("div")
	card.className = "vaultCard"

	const portrait = document.createElement("div")
	portrait.className = "vaultPortrait"

	if(entry.portrait){
		const img = document.createElement("img")
		img.src = entry.portrait
		portrait.appendChild(img)
	}else{
		portrait.textContent = t("vault.noPortrait")
	}

	const name = document.createElement("div")
	name.className = "vaultCardName"
	name.textContent = entry.name

	const uploadInput = document.createElement("input")
	uploadInput.type = "file"
	uploadInput.accept = "image/*"
	uploadInput.style.display = "none"
	uploadInput.addEventListener("click", e => e.stopPropagation())

	uploadInput.addEventListener("change", async () => {

		const file = uploadInput.files[0]
		if(!file) return

		const dataUrl = await fileToPortraitDataUrl(file)

		const raw = await readVaultCharacterFile(entry.fileName)
		const data = JSON.parse(await raw.text())
		data.portrait = dataUrl

		await writeVaultCharacter(entry.fileName, data)

		if(character.name === data.name) character.portrait = dataUrl

		onChanged()
	})

	const uploadBtn = document.createElement("button")
	uploadBtn.type = "button"
	uploadBtn.className = "vaultUploadBtn"
	uploadBtn.textContent = "🖼"
	uploadBtn.title = t("vault.uploadPortrait")
	uploadBtn.addEventListener("click", (e) => {
		e.stopPropagation()
		uploadInput.click()
	})

	const deleteBtn = document.createElement("button")
	deleteBtn.type = "button"
	deleteBtn.className = "vaultDeleteBtn"
	deleteBtn.textContent = "🗑"
	deleteBtn.title = t("vault.delete")
	deleteBtn.addEventListener("click", async (e) => {

		e.stopPropagation()
		if(!confirm(t("vault.confirmDelete", entry.name))) return

		await deleteVaultCharacter(entry.fileName)
		onChanged()
	})

	card.addEventListener("click", async () => {
		const file = await readVaultCharacterFile(entry.fileName)
		onOpen(file)
	})

	card.appendChild(portrait)
	card.appendChild(name)
	card.appendChild(uploadBtn)
	card.appendChild(uploadInput)
	card.appendChild(deleteBtn)

	return card
}

export function setupVaultUI({ onCharacterLoaded, afterHide }){

	function showVaultScreen(){

		document.querySelector(".sheet").style.display = "none"
		document.querySelector(".cardPanel").style.display = "none"
		document.getElementById("cardOverflow").style.display = "none"
		document.getElementById("sinsSection").style.display = "none"
		document.getElementById("libraryScreen").style.display = "none"
		document.getElementById("vaultScreen").style.display = ""

		document.querySelector(".book").classList.add("overlayShown")

		document.querySelectorAll(".bookmark").forEach(btn => btn.classList.remove("active"))
		document.getElementById("btnVault").classList.add("active")

		document.getElementById("btnView").disabled = false

		refreshVaultGrid()
	}

	function hideVaultScreen(){

		document.getElementById("vaultScreen").style.display = "none"
		document.querySelector(".sheet").style.display = ""
		document.querySelector(".cardPanel").style.display = ""
		document.querySelector(".book").classList.remove("overlayShown")

		afterHide()
	}

	async function refreshVaultGrid(){

		const grid = document.getElementById("vaultGrid")
		const connectPrompt = document.getElementById("vaultConnectPrompt")
		const controls = document.getElementById("vaultControls")
		const backendNote = document.getElementById("vaultBackendNote")

		if(getVaultBackend() === "indexeddb"){
			backendNote.textContent = t("vault.indexedDbNote")
			backendNote.style.display = ""
		}else{
			backendNote.style.display = "none"
		}

		if(!isVaultConnected()){
			connectPrompt.style.display = ""
			controls.style.display = "none"
			return
		}

		connectPrompt.style.display = "none"
		controls.style.display = ""

		grid.innerHTML = ""

		const entries = await listVaultCharacters()

		entries.forEach(entry => grid.appendChild(createVaultCard(entry, {
			onOpen: (file) => {
				importCharacterFromFile(file, () => {
					onCharacterLoaded()
					hideVaultScreen()
				})
			},
			onChanged: refreshVaultGrid
		})))
	}

	document.getElementById("btnVault").addEventListener("click", showVaultScreen)

	document.getElementById("btnVaultConnect").addEventListener("click", async () => {

		try{
			await connectVault()
			refreshVaultGrid()
		}catch(e){
			alert(t("vault.connectFailed"))
		}
	})

	async function saveCharacterSmart(){

		if(!isVaultConnected() && getVaultBackend() === "fs" && confirm(t("vault.connectPrompt"))){

			try{
				await connectVault()
			}catch(e){
			}
		}

		if(isVaultConnected()){
			await writeVaultCharacter(characterFileName(character), buildCharacterExportData())
			return true
		}

		exportCharacterToFile()
		return false
	}

	document.getElementById("btnExportCharacter").onclick = () => {
		exportCharacterToFile()
	}

	document.getElementById("btnImportCharacter").onclick = () => {
		document.getElementById("loadFileInput").click()
	}

	document.getElementById("loadFileInput").addEventListener("change", (e) => {

		const file = e.target.files[0]
		if(!file) return

		importCharacterFromFile(file, () => {
			onCharacterLoaded()
			hideVaultScreen()
		})

		e.target.value = ""
	})

	tryReconnectVault()

	return { showVaultScreen, hideVaultScreen, saveCharacterSmart }
}
