import { character } from "./character.js"
import { saveCharacter, loadCharacter, exportCharacterToHtml, loadPowerLibrary, loadRitualLibrary, loadPathLibrary, savePathLibrary, saveRitualLibrary, loadBackgroundTypes, loadRoadTypes, loadClans, loadDisciplineTypes, loadArchetypes, loadAbilityTypes, loadAttributeTypes } from "./storage.js"
import { clans, disciplineTypes, archetypes, backgroundTypes, roadTypes, attributeTypes, abilityTypes, pathLibrary, ritualLibrary, getEffectiveRoadSins } from "./VDA20data.js"
import { renderSheet, renderResources, renderCreation } from "./ui.js"
import { fillClanDisciplines, refundAllDisciplines } from "./logic.js"
import { getState, setState, STATES } from "./state.js"
import { updateXP } from "./editLogic.js"
import { updateFreebie } from "./freebieLogic.js"
import { createXP, syncCreationState } from "./creationLogic.js"
import { generationData } from "./generation.js"
import { getTraitType, getTraitCeiling, getTraitValue } from "./traits.js"
import { t, localize, applyStaticTranslations } from "./i18n.js"
import { sortedKeysByName, bulletsForLevel } from "./utils.js"
import { setupPortraitUI, renderPortrait } from "./portraitUI.js"
import { setupDisciplineCardUI } from "./disciplineCardUI.js"
import { setupPathRitualCardUI } from "./pathRitualCardUI.js"
import { setupVaultUI } from "./vaultUI.js"
import { setupLibraryUI } from "./libraryUI.js"
import { setupBookmarksUI } from "./bookmarksUI.js"
import { getActivePreset } from "./libraryPresets.js"

const xpInput = document.getElementById("xpInput")
const roadSelect = document.getElementById("roadSelect")
const freebieInput = document.getElementById("freebieInput")
const clanSelect = document.getElementById("clanSelect")
const nameInput = document.getElementById("characterName")
const conceptInput = document.getElementById("conceptInput")

const conceptOptionKeys = [
	"artist", "fighter", "vagrant", "cleric", "outcast", "intellectual",
	"politician", "criminal", "professional", "laborer", "child", "sleuth"
]

function populateConceptOptions(){

	const datalist = document.getElementById("conceptOptions")
	datalist.innerHTML = ""

	conceptOptionKeys.forEach(key => datalist.appendChild(new Option(t(`concept.${key}`))))
}
const genSelect = document.getElementById("generationSelect")
const natureSelect = document.getElementById("natureSelect")
const demeanorSelect = document.getElementById("demeanorSelect")

const abilityColumns = {
	talents: document.getElementById("talentsColumn"),
	skills: document.getElementById("skillsColumn"),
	knowledges: document.getElementById("knowledgesColumn")
}

const attributeColumns = {
	physical: document.getElementById("physicalColumn"),
	social: document.getElementById("socialColumn"),
	mental: document.getElementById("mentalColumn")
}

function updateUI(){
	syncDerivedTraits()
	syncCreationState()
	renderSheet()
	renderResources(xpInput, freebieInput)
	renderCreation()

	for(const slot in character.backgrounds){
		syncBiographyCard(slot)
	}

	renderSins()
	renderPortrait()
	updateRitualPathSectionVisibility()
	layoutCards()
}

function characterHasRitualPathDiscipline(){
	return Object.values(character.disciplines).some(d => d.name && disciplineTypes[d.name]?.ritualPaths)
}

function updateRitualPathSectionVisibility(){

	const display = characterHasRitualPathDiscipline() ? "" : "none"

	document.getElementById("pathCardSection").style.display = display
	document.getElementById("ritualCardSection").style.display = display
}

function renderSins(){

	const section = document.getElementById("sinsSection")
	const road = roadTypes[character.road.type]

	if(!road){
		section.style.display = "none"
		return
	}

	section.style.display = ""
	document.getElementById("sinsTitle").textContent = t("sins.headingWithRoad", localize(road.name))

	const tbody = document.getElementById("sinsTableBody")
	tbody.innerHTML = ""

	getEffectiveRoadSins(character.road.type).forEach(row => {

		const tr = document.createElement("tr")
		tr.innerHTML = `<td>${row.value}</td><td>${localize(row.sin)}</td><td>${localize(row.rationale)}</td>`
		tbody.appendChild(tr)
	})
}

function syncDerivedTraits(){

	if(getState() !== STATES.CREATE) return

	character.road.level = character.virtues.virtue1 + character.virtues.virtue2

	character.willpower.level = character.virtues.virtue3

	if(character.willpower.current > character.willpower.level){
		character.willpower.current = character.willpower.level
	}
}

const CARD_KINDS = [
	{ listId: "disciplineCardList", overflowListId: "disciplineOverflowList", overflowSectionId: "disciplineOverflowSection", addBtnId: "addDisciplineCardBtn" },
	{ listId: "biographyCardList", overflowListId: "biographyOverflowList", overflowSectionId: "biographyOverflowSection", sidebarSectionId: "biographySidebarSection" },
	{ listId: "pathCardList", overflowListId: "pathOverflowList", overflowSectionId: "pathOverflowSection", addBtnId: "addPathCardBtn" },
	{ listId: "ritualCardList", overflowListId: "ritualOverflowList", overflowSectionId: "ritualOverflowSection", addBtnId: "addRitualCardBtn" }
]

function layoutCards(){

	CARD_KINDS.forEach(kind => {

		const overflow = document.getElementById(kind.overflowListId)
		const home = document.getElementById(kind.listId)

		;[...overflow.children].forEach(card => home.appendChild(card))

		if(kind.sidebarSectionId) document.getElementById(kind.sidebarSectionId).style.display = ""
	})

	if(window.innerWidth > 760){

		const sheet = document.querySelector(".sheet")
		const cardPanel = document.querySelector(".cardPanel")
		const maxHeight = sheet.getBoundingClientRect().height

		const movable = CARD_KINDS.flatMap(kind => [...document.getElementById(kind.listId).children])

		let i = movable.length - 1

		while(i >= 0 && cardPanel.getBoundingClientRect().height > maxHeight){

			const card = movable[i]
			const kind = CARD_KINDS.find(k => k.listId === card.dataset.homeList)

			document.getElementById(kind.overflowListId).insertBefore(card, document.getElementById(kind.overflowListId).firstChild)
			i--
		}
	}

	let anyOverflow = false

	CARD_KINDS.forEach(kind => {

		const overflow = document.getElementById(kind.overflowListId)
		const home = document.getElementById(kind.listId)

		if(kind.sidebarSectionId){
			document.getElementById(kind.sidebarSectionId).style.display = home.children.length ? "" : "none"
		}

		document.getElementById(kind.overflowSectionId).style.display = overflow.children.length ? "" : "none"

		if(kind.addBtnId){

			const addBtn = document.getElementById(kind.addBtnId)

			if(overflow.children.length){
				document.getElementById(kind.overflowSectionId).appendChild(addBtn)
			}else{
				home.insertAdjacentElement("afterend", addBtn)
			}
		}

		if(overflow.children.length) anyOverflow = true
	})

	document.getElementById("cardOverflow").classList.toggle("hasContent", anyOverflow)
}

function handleXP(trait, level){

	switch(getState()){

		case STATES.EDIT:
			return updateXP(trait, level)

		case STATES.FREEBIE:
			return updateFreebie(trait, level)

		case STATES.CREATE:
			return createXP(trait, level)

		default:
			return
	}
}

function setupDotsGroup(group){

	const trait = group.dataset.trait
	const type = getTraitType(trait)
	const ceiling = getTraitCeiling(type)

	for(let i = 0; i < ceiling; i++){
		const dot = document.createElement("span")
		dot.className = "dot"
		group.appendChild(dot)
	}

	group.querySelectorAll(".dot").forEach((dot, index) => {

		dot.addEventListener("click", () => {

			const clickedLevel = index + 1

			handleXP(trait, clickedLevel)

			updateUI()
			saveCharacter()
		})
	})
}


function createAttributeRow(key){

	const row = document.createElement("div")
	row.className = "attribute"

	const label = document.createElement("span")
	label.dataset.trait = key
	label.textContent = localize(attributeTypes[key].name)

	const dots = document.createElement("div")
	dots.className = "dots"
	dots.dataset.trait = key

	row.appendChild(label)
	row.appendChild(dots)
	attributeColumns[attributeTypes[key].attributeCategory].appendChild(row)

	setupDotsGroup(dots)
}

function buildBuiltinAttributeRows(){

	document.querySelectorAll(".attribute").forEach(el => el.remove())

	for(const key in attributeTypes) createAttributeRow(key)
}

function createBuiltinAbilityRow(key, column, anchor){

	const row = document.createElement("div")
	row.className = "ability"

	const label = document.createElement("span")
	label.dataset.trait = key
	label.textContent = localize(abilityTypes[key].name)

	const dots = document.createElement("div")
	dots.className = "dots"
	dots.dataset.trait = key

	row.appendChild(label)
	row.appendChild(dots)
	column.insertBefore(row, anchor)

	setupDotsGroup(dots)
}

function buildBuiltinAbilityRows(){

	document.querySelectorAll(".ability:not(.custom)").forEach(el => el.remove())

	for(const category in abilityColumns){

		const column = abilityColumns[category]
		const anchor = column.querySelector(".ability.custom") || column.querySelector(".addAbility")

		for(const key in abilityTypes){
			if(abilityTypes[key].category !== category) continue
			createBuiltinAbilityRow(key, column, anchor)
		}
	}
}

function populateDisciplineSlotOptions(select){

	select.innerHTML = ""

	const empty = document.createElement("option")
	empty.value = ""
	empty.textContent = "--"
	select.appendChild(empty)

	for(const key of sortedKeysByName(disciplineTypes, d => localize(d.name))){
		const option = document.createElement("option")
		option.value = key
		option.textContent = localize(disciplineTypes[key].name)
		select.appendChild(option)
	}
}

function setupDisciplineSelect(select){

	populateDisciplineSlotOptions(select)

	select.addEventListener("change", () => {

		const slot = select.dataset.slot
		character.disciplines[slot].name = select.value

		updateUI()
		saveCharacter()
	})
}

function refreshDisciplineSelectOptions(){

	document.querySelectorAll(".disciplineSelect").forEach(select => {

		const current = select.value
		populateDisciplineSlotOptions(select)
		select.value = current
	})
}

function syncBiographyCard(slot){

	const type = character.backgrounds[slot].type
	let card = document.querySelector(`[data-card-slot="${slot}"]`)

	if(!type){
		if(card) card.remove()
		return
	}

	if(!card){
		card = document.createElement("div")
		card.className = "card"
		card.dataset.cardSlot = slot
		card.dataset.homeList = "biographyCardList"

		const title = document.createElement("h4")
		const body = document.createElement("div")
		body.className = "cardBody"

		card.appendChild(title)
		card.appendChild(body)
		document.getElementById("biographyCardList").appendChild(card)
	}

	const info = backgroundTypes[type]
	const level = character.backgrounds[slot].level

	if(!info){
		card.querySelector("h4").textContent = t("biography.unknownType")
		card.querySelector(".cardBody").textContent = ""
		return
	}

	card.querySelector("h4").textContent = localize(info.name)

	card.querySelector(".cardBody").textContent = level > 0
		? `${bulletsForLevel(level)} ${localize(info.levels[level - 1])}`
		: t("biography.addDots")
}

function populateBackgroundOptions(select){

	select.innerHTML = ""

	const empty = document.createElement("option")
	empty.value = ""
	empty.textContent = "--"
	select.appendChild(empty)

	for(const key of sortedKeysByName(backgroundTypes, bg => localize(bg.name))){
		const option = document.createElement("option")
		option.value = key
		option.textContent = localize(backgroundTypes[key].name)
		select.appendChild(option)
	}
}

function setupBackgroundSelect(select){

	populateBackgroundOptions(select)

	select.addEventListener("change", () => {

		const slot = select.dataset.slot
		character.backgrounds[slot].type = select.value || null

		syncBiographyCard(slot)

		updateUI()
		saveCharacter()
	})
}

function refreshBackgroundSelectOptions(){

	document.querySelectorAll(".backgroundSelect").forEach(select => {

		const current = select.value
		populateBackgroundOptions(select)
		select.value = current
	})
}

function populateRoadOptions(select){

	select.innerHTML = ""

	const empty = document.createElement("option")
	empty.value = ""
	empty.textContent = "--"
	select.appendChild(empty)

	for(const key of sortedKeysByName(roadTypes, r => localize(r.name))){
		const option = document.createElement("option")
		option.value = key
		option.textContent = localize(roadTypes[key].name)
		select.appendChild(option)
	}
}

function setupRoadSelect(select){

	populateRoadOptions(select)

	select.addEventListener("change", () => {

		character.road.type = select.value || null

		updateUI()
		saveCharacter()
	})
}

function setupVirtueChoiceSelect(select){

	const key = select.dataset.virtue
	select.value = character.virtueChoices[key]

	select.addEventListener("change", () => {
		character.virtueChoices[key] = select.value
		saveCharacter()
	})
}

function refreshRoadSelectOptions(){

	const current = roadSelect.value
	populateRoadOptions(roadSelect)
	roadSelect.value = current
}

function removeTrait(trait, type, row){

	if(getTraitValue(trait) > 0){
		alert(t("alert.removeDotsFirst"))
		return
	}

	if(type === "disciplines"){
		delete character.disciplines[trait]
	}else if(type === "backgrounds"){

		delete character.backgrounds[trait]

		const card = document.querySelector(`[data-card-slot="${trait}"]`)
		if(card) card.remove()

	}else{
		delete character.customAbilities[trait]
	}

	row.remove()

	updateUI()
	saveCharacter()
}

function createDisciplineRow(slotKey){

	const row = document.createElement("div")
	row.className = "discipline custom"

	const header = document.createElement("div")
	header.className = "disciplineHeader"

	const select = document.createElement("select")
	select.className = "disciplineSelect"
	select.dataset.slot = slotKey

	const removeBtn = document.createElement("button")
	removeBtn.type = "button"
	removeBtn.className = "removeTrait"
	removeBtn.textContent = "×"
	removeBtn.addEventListener("click", () => removeTrait(slotKey, "disciplines", row))

	header.appendChild(select)
	header.appendChild(removeBtn)

	const dots = document.createElement("div")
	dots.className = "dots"
	dots.dataset.trait = slotKey

	row.appendChild(header)
	row.appendChild(dots)

	document.getElementById("addDisciplineBtn").insertAdjacentElement("beforebegin", row)

	setupDisciplineSelect(select)
	setupDotsGroup(dots)
}

function createBackgroundRow(slotKey){

	const row = document.createElement("div")
	row.className = "background custom"

	const select = document.createElement("select")
	select.className = "backgroundSelect"
	select.dataset.slot = slotKey

	const dots = document.createElement("div")
	dots.className = "dots"
	dots.dataset.trait = slotKey

	const removeBtn = document.createElement("button")
	removeBtn.type = "button"
	removeBtn.className = "removeTrait"
	removeBtn.textContent = "×"
	removeBtn.addEventListener("click", () => removeTrait(slotKey, "backgrounds", row))

	row.appendChild(select)
	row.appendChild(dots)
	row.appendChild(removeBtn)

	document.getElementById("addBackgroundBtn").insertAdjacentElement("beforebegin", row)

	setupBackgroundSelect(select)
	setupDotsGroup(dots)
}

function createAbilityRow(category, id, name){

	const column = abilityColumns[category]
	const addControl = column.querySelector(".addAbility")

	const row = document.createElement("div")
	row.className = "ability custom"

	const header = document.createElement("div")
	header.className = "abilityHeader"

	const label = document.createElement("span")
	label.textContent = name

	const removeBtn = document.createElement("button")
	removeBtn.type = "button"
	removeBtn.className = "removeTrait"
	removeBtn.textContent = "×"
	removeBtn.addEventListener("click", () => removeTrait(id, "customAbilities", row))

	header.appendChild(label)
	header.appendChild(removeBtn)

	const dots = document.createElement("div")
	dots.className = "dots"
	dots.dataset.trait = id

	row.appendChild(header)
	row.appendChild(dots)

	column.insertBefore(row, addControl)

	setupDotsGroup(dots)
}

function populateClanOptions(select){

	select.innerHTML = ""

	const empty = document.createElement("option")
	empty.value = ""
	empty.textContent = t("select.clan")
	select.appendChild(empty)

	for(const key of sortedKeysByName(clans, clan => localize(clan.name))){

		const option = document.createElement("option")
		option.value = key
		option.textContent = localize(clans[key].name)

		select.appendChild(option)
	}
}

function refreshClanSelectOptions(){

	const current = clanSelect.value
	populateClanOptions(clanSelect)
	clanSelect.value = current
}

function populateArchetypeSelect(select, placeholderKey){

	select.innerHTML = ""

	const empty = document.createElement("option")
	empty.value = ""
	empty.textContent = t(placeholderKey)
	select.appendChild(empty)

	for(const key of sortedKeysByName(archetypes, archetype => localize(archetype.name))){
		const option = document.createElement("option")
		option.value = key
		option.textContent = localize(archetypes[key].name)
		select.appendChild(option)
	}
}

function refreshArchetypeSelects(){

	const nature = natureSelect.value
	const demeanor = demeanorSelect.value

	populateArchetypeSelect(natureSelect, "select.nature")
	populateArchetypeSelect(demeanorSelect, "select.demeanor")

	natureSelect.value = nature
	demeanorSelect.value = demeanor
}

function resetCustomRows(){

	document.querySelectorAll(".discipline.custom, .background.custom, .ability.custom").forEach(el => el.remove())

	document.getElementById("disciplineCardList").innerHTML = ""
	document.getElementById("disciplineOverflowList").innerHTML = ""
	document.getElementById("biographyCardList").innerHTML = ""
	document.getElementById("biographyOverflowList").innerHTML = ""
	document.getElementById("pathCardList").innerHTML = ""
	document.getElementById("pathOverflowList").innerHTML = ""
	document.getElementById("ritualCardList").innerHTML = ""
	document.getElementById("ritualOverflowList").innerHTML = ""
}

function backfillCustomRows(){

	for(const slotKey in character.disciplines){
		if(!document.querySelector(`.dots[data-trait="${slotKey}"]`)){
			createDisciplineRow(slotKey)
		}
	}

	for(const id in character.customAbilities){
		if(!document.querySelector(`.dots[data-trait="${id}"]`)){
			const { category, name } = character.customAbilities[id]
			createAbilityRow(category, id, name)
		}
	}

	for(const slot in character.backgrounds){
		if(!document.querySelector(`.dots[data-trait="${slot}"]`)){
			createBackgroundRow(slot)
		}
		syncBiographyCard(slot)
	}

	for(const id in character.disciplineCards){
		if(!document.querySelector(`[data-card-id="${id}"]`)){
			createDisciplineCard(id, character.disciplineCards[id])
		}
	}

	for(const id in character.pathCards){
		if(!document.querySelector(`[data-card-id="${id}"]`)){
			createPathCard(id, character.pathCards[id])
		}
	}

	for(const id in character.ritualCards){
		if(!document.querySelector(`[data-card-id="${id}"]`)){
			createRitualCard(id, character.ritualCards[id])
		}
	}
}


const { createDisciplineCard, rebuildDisciplineCards, deletePowerFromLibrary } = setupDisciplineCardUI({ updateUI })

const {
	createPathCard, rebuildPathCards, deletePathFromLibrary,
	createRitualCard, rebuildRitualCards, deleteRitualFromLibrary
} = setupPathRitualCardUI({ updateUI, pathLibrary, savePathLibrary, ritualLibrary, saveRitualLibrary })

setupPortraitUI()

function refreshLibraryDependentUI(){
	refreshClanSelectOptions()
	refreshDisciplineSelectOptions()
	refreshArchetypeSelects()
	refreshBackgroundSelectOptions()
	refreshRoadSelectOptions()
	rebuildDisciplineCards()
	rebuildPathCards()
	rebuildRitualCards()
	buildBuiltinAttributeRows()
	buildBuiltinAbilityRows()
	applyPresetTheme()
	populateConceptOptions()

	updateUI()
}

function applyPresetTheme(){

	const isMasquerade = getActivePreset().id === "masquerade"

	document.body.classList.toggle("themeMasquerade", isMasquerade)
	document.getElementById("sheetTitle").textContent = isMasquerade ? "VAMPIRE: THE MASQUERADE" : "VAMPIRE: THE DARK AGES"
}

const { hideVaultScreen, saveCharacterSmart } = setupVaultUI({

	onCharacterLoaded: () => {
		resetCustomRows()
		backfillCustomRows()
		updateUI()
		saveCharacter()
	},

	afterHide: updateUI
})

const { hideLibraryScreen } = setupLibraryUI({
	onLibraryChanged: refreshLibraryDependentUI,
	afterHide: updateUI,
	deletePowerFromLibrary,
	deletePathFromLibrary,
	deleteRitualFromLibrary
})

setupBookmarksUI({

	updateUI,

	hideOverlayScreens: () => {
		hideVaultScreen()
		hideLibraryScreen()
	},

	refreshLibraryDependentUI,
	resetCustomRows,
	backfillCustomRows,
	saveCharacterSmart
})


xpInput.addEventListener("input", () => {
	character.xp = parseInt(xpInput.value) || 0
	saveCharacter()
})

freebieInput.addEventListener("input", () => {
	character.freebie = parseInt(freebieInput.value) || 0
	saveCharacter()
})

nameInput.addEventListener("input", () => {
	character.name = nameInput.value
	saveCharacter()
})

conceptInput.addEventListener("input", () => {
	character.concept = conceptInput.value
	saveCharacter()
})

document.getElementById("sireNotes").addEventListener("input", (e) => {
	character.sireNotes = e.target.value
	saveCharacter()
})

document.getElementById("clanFlawNotes").addEventListener("input", (e) => {
	character.clanFlaw = e.target.value
	saveCharacter()
})

document.getElementById("notesText").addEventListener("input", (e) => {
	character.notes = e.target.value
	saveCharacter()
})

genSelect.addEventListener("change", () => {

	const gen = parseInt(genSelect.value)
	character.generation = gen

	const data = generationData[gen]

	character.blood.max = data.bloodPool

	if(character.blood.current > data.bloodPool)
		character.blood.current = data.bloodPool

	updateUI()
	saveCharacter()
})

document.getElementById("btnSaveHtml").onclick = () => {
	exportCharacterToHtml()
}

clanSelect.addEventListener("change", () => {

	const newClan = clanSelect.value

	refundAllDisciplines()

	character.clan = newClan

	fillClanDisciplines()

	updateUI()
	saveCharacter()
})

natureSelect.addEventListener("change", () => {
	character.nature = natureSelect.value || null
	updateUI()
	saveCharacter()
})

demeanorSelect.addEventListener("change", () => {
	character.demeanor = demeanorSelect.value || null
	updateUI()
	saveCharacter()
})

document.querySelectorAll(".addAbility").forEach(control => {

	const category = control.dataset.category
	const input = control.querySelector(".addAbilityInput")
	const btn = control.querySelector(".addAbilityBtn")

	const addAbility = () => {

		const name = input.value.trim()
		if(!name) return

		const id = `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`

		character.customAbilities[id] = { name, category, level: 0 }

		createAbilityRow(category, id, name)

		input.value = ""

		updateUI()
		saveCharacter()
	}

	btn.addEventListener("click", addAbility)

	input.addEventListener("keydown", (e) => {
		if(e.key === "Enter") addAbility()
	})
})

document.getElementById("addDisciplineBtn").addEventListener("click", () => {

	let n = 1
	while(character.disciplines[`slot${n}`]) n++

	const slotKey = `slot${n}`
	character.disciplines[slotKey] = { name: null, level: 0 }

	createDisciplineRow(slotKey)

	updateUI()
	saveCharacter()
})

document.getElementById("addBackgroundBtn").addEventListener("click", () => {

	let n = 1
	while(character.backgrounds[`background${n}`]) n++

	const slotKey = `background${n}`
	character.backgrounds[slotKey] = { type: null, level: 0 }

	createBackgroundRow(slotKey)

	updateUI()
	saveCharacter()
})

document.querySelectorAll(".willpowerCurrent input").forEach((cb, index) => {

	cb.addEventListener("click", () => {

		const newValue = index + 1

		if(cb.checked)
			character.willpower.current = newValue
		else
			character.willpower.current = index

		saveCharacter()
		updateUI()
	})
})

document.querySelectorAll(".healthInput").forEach((input, index) => {

	input.addEventListener("input", () => {
		character.health[index] = input.value
		saveCharacter()
	})
})

document.querySelectorAll(".bloodPoints input").forEach((cb, index) => {

	cb.addEventListener("click", () => {

		if(cb.checked)
			character.blood.current = index + 1
		else
			character.blood.current = index

		saveCharacter()
		updateUI()
	})
})


loadPowerLibrary()
loadRitualLibrary()
loadPathLibrary()
loadBackgroundTypes()
loadRoadTypes()
loadClans()
loadDisciplineTypes()
loadArchetypes()
loadAbilityTypes()
loadAttributeTypes()
loadCharacter()

if(character.creation.active) setState(STATES.CREATE)

document.querySelectorAll(".dots").forEach(setupDotsGroup)
document.querySelectorAll(".disciplineSelect").forEach(setupDisciplineSelect)
document.querySelectorAll(".backgroundSelect").forEach(setupBackgroundSelect)
setupRoadSelect(roadSelect)
document.querySelectorAll(".virtueChoiceSelect").forEach(setupVirtueChoiceSelect)
populateClanOptions(clanSelect)
populateArchetypeSelect(natureSelect, "select.nature")
populateArchetypeSelect(demeanorSelect, "select.demeanor")

buildBuiltinAttributeRows()
buildBuiltinAbilityRows()

backfillCustomRows()

applyStaticTranslations()
applyPresetTheme()
populateConceptOptions()

updateUI()

let resizeTimeout
window.addEventListener("resize", () => {
	clearTimeout(resizeTimeout)
	resizeTimeout = setTimeout(layoutCards, 150)
})
