import { character } from "./character.js"
import { powerLibrary } from "./powerLibrary.js"
import { backgroundTypes } from "./backgroundTypes.js"
import { roadTypes } from "./roadTypes.js"
import { clans } from "./clans.js"
import { disciplineTypes } from "./disciplineTypes.js"
import { archetypes } from "./archetypes.js"

function applyCharacterData(data){

	Object.assign(character.attributes, data.attributes || {})
	Object.assign(character.abilities, data.abilities || {})
	Object.assign(character.customAbilities, data.customAbilities || {})
	Object.assign(character.disciplines, data.disciplines || {})
	Object.assign(character.virtues, data.virtues || {})
	Object.assign(character.road, data.road || {})
	Object.assign(character.willpower, data.willpower || {})
	Object.assign(character.blood, data.blood || {})
	Object.assign(character.disciplineCards, data.disciplineCards || {})

	// backgrounds used to be plain numbers (dot level only, no type) - migrate old saves
	for(const key in data.backgrounds || {}){

		const saved = data.backgrounds[key]

		character.backgrounds[key] = typeof saved === "number"
			? { type: null, level: saved }
			: { type: null, level: 0, ...saved }
	}

	character.name = data.name || ""
	character.clan = data.clan || null
	character.nature = data.nature || null
	character.demeanor = data.demeanor || null
	character.sireNotes = data.sireNotes || ""
	character.generation = data.generation || character.generation
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

// bakes the live value/selection of every form control into a real HTML
// attribute before serializing - otherwise typed text, textarea content and
// the current <select> choice never show up in outerHTML at all, since
// those live only in the DOM property, not the original attribute
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

	root.querySelectorAll("textarea").forEach(textarea => {
		textarea.textContent = textarea.value
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

// the power library is shared across characters, so it lives in its own
// storage slot rather than inside any one character's save
export function savePowerLibrary(){
	localStorage.setItem("vtmPowerLibrary", JSON.stringify(powerLibrary))
}

export function loadPowerLibrary(){

	const saved = localStorage.getItem("vtmPowerLibrary")
	if(!saved) return

	Object.assign(powerLibrary, JSON.parse(saved))
}

export function exportCharacterToFile(){

	// bundle the specific power definitions this character actually uses, so the
	// file stays self-contained if it's ever loaded somewhere the library is empty
	const usedPowerIds = Object.values(character.disciplineCards)
		.map(card => card.powerId)
		.filter(Boolean)

	const powerSnapshot = {}
	usedPowerIds.forEach(id => {
		if(powerLibrary[id]) powerSnapshot[id] = powerLibrary[id]
	})

	const exportData = { ...character, _powerLibrary: powerSnapshot }

	const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
	downloadBlob(blob, `${getSafeFileName()}.json`)
}

export async function exportCharacterToHtml(){

	const sheetEl = document.querySelector(".sheet")
	const cardPanelEl = document.querySelector(".cardPanel")
	const cardOverflowEl = document.getElementById("cardOverflow")
	const sinsEl = document.getElementById("sinsSection")

	// freeze the live elements themselves (not a clone) - toggling these
	// attributes to match what's already selected/typed/checked has no
	// visible effect on the page, but cloneNode isn't reliable at carrying
	// a <select>'s current choice over to the copy, so this is done first
	freezeFormState(sheetEl)
	freezeFormState(cardPanelEl)
	freezeFormState(cardOverflowEl)
	freezeFormState(sinsEl)

	const css = await fetch("style.css").then(r => r.text())

	const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>${character.name || "Character"}</title>
<style>${css}
/* this is a static export - the editing controls (×/🗑 remove, "+" add) have
   no handler here, so hide them */
.removeTrait, .deletePowerBtn, .addAbility, .addSlotBtn{ display:none; }
</style>
</head>
<body>
<div class="book">
${sheetEl.outerHTML}
${cardPanelEl.outerHTML}
</div>
${cardOverflowEl.outerHTML}
${sinsEl.outerHTML}
</body>
</html>`

	downloadBlob(new Blob([html], { type: "text/html" }), `${getSafeFileName()}.html`)
}

export function saveBackgroundTypes(){
	localStorage.setItem("vtmBackgroundTypes", JSON.stringify(backgroundTypes))
}

export function loadBackgroundTypes(){

	const saved = localStorage.getItem("vtmBackgroundTypes")
	if(!saved) return

	Object.assign(backgroundTypes, JSON.parse(saved))
}

export function saveRoadTypes(){
	localStorage.setItem("vtmRoadTypes", JSON.stringify(roadTypes))
}

export function loadRoadTypes(){

	const saved = localStorage.getItem("vtmRoadTypes")
	if(!saved) return

	Object.assign(roadTypes, JSON.parse(saved))
}

export function saveClans(){
	localStorage.setItem("vtmClans", JSON.stringify(clans))
}

export function loadClans(){

	const saved = localStorage.getItem("vtmClans")
	if(!saved) return

	Object.assign(clans, JSON.parse(saved))
}

export function saveDisciplineTypes(){
	localStorage.setItem("vtmDisciplineTypes", JSON.stringify(disciplineTypes))
}

export function loadDisciplineTypes(){

	const saved = localStorage.getItem("vtmDisciplineTypes")
	if(!saved) return

	Object.assign(disciplineTypes, JSON.parse(saved))
}

export function saveArchetypes(){
	localStorage.setItem("vtmArchetypes", JSON.stringify(archetypes))
}

export function loadArchetypes(){

	const saved = localStorage.getItem("vtmArchetypes")
	if(!saved) return

	Object.assign(archetypes, JSON.parse(saved))
}

// each library category has its own telltale shape, which is the one thing
// the app needs to check to sort a merged file's entries back into the
// right bucket:
//   road type       - a "sins" array (one row per rating)
//   background type - a "levels" array (one description per dot)
//   clan            - a "disciplines" array (its in-clan discipline keys)
//   power           - a "discipline" key plus a numeric "level"
//   archetype       - a "description", but no "discipline"/"level"
//   discipline type - whatever's left, just a "name"
function classifyLibraryEntry(entry){

	if(Array.isArray(entry?.sins)) return "roadTypes"
	if(Array.isArray(entry?.levels)) return "backgroundTypes"
	if(Array.isArray(entry?.disciplines)) return "clans"
	if(entry?.discipline !== undefined && entry?.level !== undefined) return "powerLibrary"
	if(entry?.description !== undefined) return "archetypes"
	return "disciplineTypes"
}

// the power library, the background types (факты биографии), the road types
// (дороги, with their sin tables), the clans, the canonical discipline names
// and the nature/demeanor archetypes are all shared/growing rather than tied
// to one character, so they get their own download/upload pair (mirroring
// the character save/load above) instead of living inside a character's
// export file - all of them live in one file so there's only one thing to
// hand-edit and re-import, and the app sorts each entry back into the right
// bucket by its shape
export function exportLibraryToFile(){

	const merged = { ...powerLibrary, ...backgroundTypes, ...roadTypes, ...clans, ...disciplineTypes, ...archetypes }
	const blob = new Blob([JSON.stringify(merged, null, 2)], { type: "application/json" })
	downloadBlob(blob, "library.json")
}

export function importLibraryFromFile(file, onDone){

	const reader = new FileReader()

	reader.onload = () => {

		const data = JSON.parse(reader.result)

		const buckets = { powerLibrary, backgroundTypes, roadTypes, clans, disciplineTypes, archetypes }

		// replace rather than merge, so removing/renaming an entry by hand
		// in the file actually takes effect instead of lingering
		for(const bucket of Object.values(buckets)){
			for(const key in bucket) delete bucket[key]
		}

		for(const key in data){
			const entry = data[key]
			buckets[classifyLibraryEntry(entry)][key] = entry
		}

		savePowerLibrary()
		saveBackgroundTypes()
		saveRoadTypes()
		saveClans()
		saveDisciplineTypes()
		saveArchetypes()
		onDone()
	}

	reader.readAsText(file)
}

export function importCharacterFromFile(file, onDone){

	const reader = new FileReader()

	reader.onload = () => {

		const data = JSON.parse(reader.result)

		if(data._powerLibrary){
			Object.assign(powerLibrary, data._powerLibrary)
			savePowerLibrary()
		}

		applyCharacterData(data)
		onDone()
	}

	reader.readAsText(file)
}