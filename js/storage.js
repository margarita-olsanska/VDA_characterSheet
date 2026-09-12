import { character } from "./character.js"
import { powerLibrary, ritualLibrary, pathLibrary, backgroundTypes, roadTypes, clans, disciplineTypes, archetypes, abilityTypes, attributeTypes } from "./VDA20data.js"

function applyCharacterData(data){

	Object.assign(character.attributes, data.attributes || {})
	Object.assign(character.abilities, data.abilities || {})
	Object.assign(character.customAbilities, data.customAbilities || {})
	Object.assign(character.disciplines, data.disciplines || {})
	Object.assign(character.virtues, data.virtues || {})
	Object.assign(character.virtueChoices, data.virtueChoices || {})
	Object.assign(character.road, data.road || {})
	Object.assign(character.willpower, data.willpower || {})
	Object.assign(character.blood, data.blood || {})
	Object.assign(character.health, data.health || [])
	Object.assign(character.disciplineCards, data.disciplineCards || {})
	Object.assign(character.pathCards, data.pathCards || {})
	Object.assign(character.ritualCards, data.ritualCards || {})

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
	character.clanFlaw = data.clanFlaw || ""
	character.concept = data.concept || ""
	character.notes = data.notes || ""
	character.generation = data.generation || character.generation
	character.xp = data.xp || 0
	character.freebie = data.freebie || 0
	character.portrait = data.portrait || null

	character.creation.active = data.creation ? !!data.creation.active : false
	character.creation.stage = data.creation?.stage || character.creation.stage
}

export function getSafeFileName(){

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

export function savePowerLibrary(){
	localStorage.setItem("vtmPowerLibrary", JSON.stringify(powerLibrary))
}

export function loadPowerLibrary(){

	const saved = localStorage.getItem("vtmPowerLibrary")
	if(!saved) return

	Object.assign(powerLibrary, JSON.parse(saved))
}

export function saveRitualLibrary(){
	localStorage.setItem("vtmRitualLibrary", JSON.stringify(ritualLibrary))
}

export function loadRitualLibrary(){

	const saved = localStorage.getItem("vtmRitualLibrary")
	if(!saved) return

	Object.assign(ritualLibrary, JSON.parse(saved))
}

export function savePathLibrary(){
	localStorage.setItem("vtmPathLibrary", JSON.stringify(pathLibrary))
}

export function loadPathLibrary(){

	const saved = localStorage.getItem("vtmPathLibrary")
	if(!saved) return

	Object.assign(pathLibrary, JSON.parse(saved))
}

function snapshotUsedEntries(cards, refKey, library){

	const snapshot = {}

	Object.values(cards).forEach(card => {
		const id = card[refKey]
		if(id && library[id]) snapshot[id] = library[id]
	})

	return snapshot
}

export function buildCharacterExportData(){

	return {
		...character,
		_powerLibrary: snapshotUsedEntries(character.disciplineCards, "powerId", powerLibrary),
		_ritualLibrary: snapshotUsedEntries(character.ritualCards, "ritualId", ritualLibrary),
		_pathLibrary: snapshotUsedEntries(character.pathCards, "pathId", pathLibrary)
	}
}

export function exportCharacterToFile(){

	const exportData = buildCharacterExportData()

	const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
	downloadBlob(blob, `${getSafeFileName()}.json`)
}

export async function exportCharacterToHtml(){

	const sheetEl = document.querySelector(".sheet")
	const cardPanelEl = document.querySelector(".cardPanel")
	const cardOverflowEl = document.getElementById("cardOverflow")
	const sinsEl = document.getElementById("sinsSection")

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

export function saveAbilityTypes(){
	localStorage.setItem("vtmAbilityTypes", JSON.stringify(abilityTypes))
}

export function loadAbilityTypes(){

	const saved = localStorage.getItem("vtmAbilityTypes")
	if(!saved) return

	Object.assign(abilityTypes, JSON.parse(saved))
}

export function saveAttributeTypes(){
	localStorage.setItem("vtmAttributeTypes", JSON.stringify(attributeTypes))
}

export function loadAttributeTypes(){

	const saved = localStorage.getItem("vtmAttributeTypes")
	if(!saved) return

	Object.assign(attributeTypes, JSON.parse(saved))
}

function classifyLibraryEntry(entry){

	if(Array.isArray(entry?.sins) || entry?.parentRoad !== undefined) return "roadTypes"
	if(Array.isArray(entry?.levels)) return "backgroundTypes"
	if(Array.isArray(entry?.disciplines)) return "clans"

	if(entry?.discipline !== undefined && entry?.level !== undefined){
		if(entry?.isRitual) return "ritualLibrary"
		if(entry?.rules !== undefined || entry?.description !== undefined) return "powerLibrary"
		return "pathLibrary"
	}

	if(entry?.description !== undefined) return "archetypes"
	if(entry?.attributeCategory !== undefined) return "attributeTypes"
	if(entry?.category !== undefined) return "abilityTypes"
	return "disciplineTypes"
}

export function exportLibraryToFile(){

	const merged = {
		...powerLibrary, ...ritualLibrary, ...pathLibrary, ...backgroundTypes, ...roadTypes,
		...clans, ...disciplineTypes, ...archetypes, ...abilityTypes, ...attributeTypes
	}
	const blob = new Blob([JSON.stringify(merged, null, 2)], { type: "application/json" })
	downloadBlob(blob, "library.json")
}

export function importLibraryFromFile(file, onDone){

	const reader = new FileReader()

	reader.onload = () => {

		const data = JSON.parse(reader.result)

		const buckets = {
			powerLibrary, ritualLibrary, pathLibrary, backgroundTypes, roadTypes,
			clans, disciplineTypes, archetypes, abilityTypes, attributeTypes
		}

		for(const bucket of Object.values(buckets)){
			for(const key in bucket) delete bucket[key]
		}

		for(const key in data){
			const entry = data[key]
			buckets[classifyLibraryEntry(entry)][key] = entry
		}

		savePowerLibrary()
		saveRitualLibrary()
		savePathLibrary()
		saveBackgroundTypes()
		saveRoadTypes()
		saveClans()
		saveDisciplineTypes()
		saveArchetypes()
		saveAbilityTypes()
		saveAttributeTypes()
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

		if(data._ritualLibrary){
			Object.assign(ritualLibrary, data._ritualLibrary)
			saveRitualLibrary()
		}

		if(data._pathLibrary){
			Object.assign(pathLibrary, data._pathLibrary)
			savePathLibrary()
		}

		applyCharacterData(data)
		onDone()
	}

	reader.readAsText(file)
}
