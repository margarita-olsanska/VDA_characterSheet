import { character } from "./character.js"

function applyCharacterData(data){

	Object.assign(character.attributes, data.attributes || {})
	Object.assign(character.abilities, data.abilities || {})
	Object.assign(character.disciplines, data.disciplines || {})
	Object.assign(character.backgrounds, data.backgrounds || {})
	Object.assign(character.virtues, data.virtues || {})

	character.name = data.name || ""
	character.clan = data.clan || null
	character.xp = data.xp || 0
	character.freebie = data.freebie || 0
}

function getSafeFileName(){

	const trimmed = (character.name || "").trim()
	if(!trimmed) return "character"

	return trimmed.replace(/[\\/:*?"<>|]+/g, "_")
}

function downloadBlob(blob, filename){

	const url = URL.createObjectURL(blob)

	const link = document.createElement("a")
	link.href = url
	link.download = filename
	link.click()

	setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function freezeFormState(root){

	root.querySelectorAll("input").forEach(input => {

		if(input.type === "checkbox" || input.type === "radio"){
			input.toggleAttribute("checked", input.checked)
		}else{
			input.setAttribute("value", input.value)
		}
	})

	root.querySelectorAll("select").forEach(select => {
		[...select.options].forEach(option => {
			option.toggleAttribute("selected", option.value === select.value)
		})
	})
}

export function saveCharacter() {
	localStorage.setItem("vtmCharacter", JSON.stringify(character))
}

export function loadCharacter() {

	const saved = localStorage.getItem("vtmCharacter")
	if(!saved) return

	applyCharacterData(JSON.parse(saved))
}

export function exportCharacterToFile(){

	const blob = new Blob([JSON.stringify(character, null, 2)], { type: "application/json" })
	downloadBlob(blob, `${getSafeFileName()}.json`)
}

export async function exportCharacterToHtml(){

	const sheetClone = document.querySelector(".sheet").cloneNode(true)
	freezeFormState(sheetClone)

	const css = await fetch("style.css").then(r => r.text())

	const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>${character.name || "Character"}</title>
<style>${css}</style>
</head>
<body>
<div class="book">
${sheetClone.outerHTML}
</div>
</body>
</html>`

	downloadBlob(new Blob([html], { type: "text/html" }), `${getSafeFileName()}.html`)
}

export function importCharacterFromFile(file, onDone){

	const reader = new FileReader()

	reader.onload = () => {
		applyCharacterData(JSON.parse(reader.result))
		onDone()
	}

	reader.readAsText(file)
}