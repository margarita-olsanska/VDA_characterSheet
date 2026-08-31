import { character } from "./character.js"
import { saveCharacter, loadCharacter, exportCharacterToFile, exportCharacterToHtml, importCharacterFromFile, savePowerLibrary, loadPowerLibrary, loadBackgroundTypes, loadRoadTypes, loadClans, loadDisciplineTypes, loadArchetypes, exportLibraryToFile, importLibraryFromFile } from "./storage.js"
import { powerLibrary } from "./powerLibrary.js"
import { renderSheet, renderResources, renderCreation } from "./ui.js"
import { clans } from "./clans.js"
import { fillClanDisciplines, refundAllDisciplines } from "./logic.js"
import { disciplineTypes } from "./disciplineTypes.js"
import { getState, setState, STATES } from "./state.js"
import { updateXP } from "./editLogic.js"
import { updateFreebie } from "./freebieLogic.js"
import { createXP, syncCreationState } from "./creationLogic.js"
import { generationData } from "./generation.js"
import { getTraitType, getTraitCeiling, getTraitValue } from "./traits.js"
import { archetypes } from "./archetypes.js"
import { backgroundTypes } from "./backgroundTypes.js"
import { roadTypes } from "./roadTypes.js"

const xpInput = document.getElementById("xpInput")
const roadSelect = document.getElementById("roadSelect")
const freebieInput = document.getElementById("freebieInput")
const clanSelect = document.getElementById("clanSelect")
const nameInput = document.getElementById("characterName")
const genSelect = document.getElementById("generationSelect")
const natureSelect = document.getElementById("natureSelect")
const demeanorSelect = document.getElementById("demeanorSelect")

function sortedKeysByName(dict, getName){
	return Object.keys(dict).sort((a, b) => getName(dict[a]).localeCompare(getName(dict[b]), "ru"))
}

// renders a level as classic dot notation text, grouped in fives: 7 -> "••••• ••"
function bulletsForLevel(level, groupSize = 5){

	const groups = []

	for(let i = 0; i < level; i += groupSize){
		groups.push("•".repeat(Math.min(groupSize, level - i)))
	}

	return groups.join(" ")
}

const abilityColumns = {
	talents: document.getElementById("talentsColumn"),
	skills: document.getElementById("skillsColumn"),
	knowledges: document.getElementById("knowledgesColumn")
}

function updateUI(){
	syncDerivedTraits()
	syncCreationState()
	renderSheet()
	renderResources(xpInput, freebieInput)
	renderCreation()

	// biography cards show the description for the current highest dot, so
	// they need refreshing whenever a background's level changes too, not
	// just when its picked type changes
	for(const slot in character.backgrounds){
		syncBiographyCard(slot)
	}

	renderSins()
	layoutCards()
}

// shows the sin table for the character's chosen road at the very bottom of
// the page, below everything else - hidden entirely while no road is picked
function renderSins(){

	const section = document.getElementById("sinsSection")
	const road = roadTypes[character.road.type]

	if(!road){
		section.style.display = "none"
		return
	}

	section.style.display = ""
	document.getElementById("sinsTitle").textContent = `Грехи: ${road.name}`

	const tbody = document.getElementById("sinsTableBody")
	tbody.innerHTML = ""

	road.sins.forEach(row => {

		const tr = document.createElement("tr")
		tr.innerHTML = `<td>${row.value}</td><td>${row.sin}</td><td>${row.rationale}</td>`
		tbody.appendChild(tr)
	})
}

// at character creation, road and willpower start at values derived from the
// virtues (road = Совесть/Решимость + Самоконтроль/Инстинкт, willpower = Смелость)
// instead of being bought from a point pool - after creation both are bought
// independently with xp/freebie, like any other trait, so this only applies
// while still in creation mode
function syncDerivedTraits(){

	if(getState() !== STATES.CREATE) return

	character.road.level = character.virtues.virtue1 + character.virtues.virtue2

	character.willpower.level = character.virtues.virtue3

	if(character.willpower.current > character.willpower.level){
		character.willpower.current = character.willpower.level
	}
}

// keeps the card panel from growing taller than the sheet: once it would,
// the newest discipline/biography cards spill below the whole book, each
// kind kept in its own bordered section (disciplines always shown first)
function layoutCards(){

	const disciplineOverflow = document.getElementById("disciplineOverflowList")
	const biographyOverflow = document.getElementById("biographyOverflowList")
	const biographySidebarSection = document.getElementById("biographySidebarSection")

	// put everything back in its home list first, so this always recomputes from scratch -
	// including making the (possibly hidden) sidebar section visible again so its height
	// is measured correctly below
	;[...disciplineOverflow.children].forEach(card => document.getElementById("disciplineCardList").appendChild(card))
	;[...biographyOverflow.children].forEach(card => document.getElementById("biographyCardList").appendChild(card))
	biographySidebarSection.style.display = ""

	// below this width the panel already stacks under the sheet on its own - nothing to split
	if(window.innerWidth > 760){

		const sheet = document.querySelector(".sheet")
		const cardPanel = document.querySelector(".cardPanel")
		const maxHeight = sheet.getBoundingClientRect().height

		const movable = [
			...document.getElementById("disciplineCardList").children,
			...document.getElementById("biographyCardList").children
		]

		let i = movable.length - 1

		while(i >= 0 && cardPanel.getBoundingClientRect().height > maxHeight){

			const card = movable[i]
			const target = card.dataset.homeList === "disciplineCardList" ? disciplineOverflow : biographyOverflow

			target.insertBefore(card, target.firstChild)
			i--
		}
	}

	// the sidebar's biography section has no "+" button of its own (unlike disciplines),
	// so once every card in it has moved out (or none were ever picked), the empty
	// header serves no purpose and should disappear rather than sit there empty
	biographySidebarSection.style.display = document.getElementById("biographyCardList").children.length ? "" : "none"

	document.getElementById("disciplineOverflowSection").style.display = disciplineOverflow.children.length ? "" : "none"
	document.getElementById("biographyOverflowSection").style.display = biographyOverflow.children.length ? "" : "none"

	// the "add" button always sits after every discipline card - if any spilled
	// below the sheet, the button moves down there too instead of staying stuck
	// between the sidebar's remaining cards and the overflowed ones
	const addDisciplineCardBtn = document.getElementById("addDisciplineCardBtn")

	if(disciplineOverflow.children.length){
		document.getElementById("disciplineOverflowSection").appendChild(addDisciplineCardBtn)
	}else{
		document.getElementById("disciplineCardList").insertAdjacentElement("afterend", addDisciplineCardBtn)
	}

	document.getElementById("cardOverflow").classList.toggle(
		"hasContent",
		disciplineOverflow.children.length > 0 || biographyOverflow.children.length > 0
	)
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
			return // ничего не делаем
	}
}

// generates the dot spans for one .dots group and wires up their clicks
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

// (re)populates a discipline-slot <select>'s options from the current library
function populateDisciplineSlotOptions(select){

	select.innerHTML = ""

	const empty = document.createElement("option")
	empty.value = ""
	empty.textContent = "--"
	select.appendChild(empty)

	for(const key of sortedKeysByName(disciplineTypes, d => d.name)){
		const option = document.createElement("option")
		option.value = key
		option.textContent = disciplineTypes[key].name
		select.appendChild(option)
	}
}

// populates a discipline <select>'s options and wires its change handler
function setupDisciplineSelect(select){

	populateDisciplineSlotOptions(select)

	select.addEventListener("change", () => {

		const slot = select.dataset.slot
		character.disciplines[slot].name = select.value

		updateUI()
		saveCharacter()
	})
}

// used after importing a library file, keeping each select's current pick
// if it's still a valid key
function refreshDisciplineSelectOptions(){

	document.querySelectorAll(".disciplineSelect").forEach(select => {

		const current = select.value
		populateDisciplineSlotOptions(select)
		select.value = current
	})
}

// shows/updates/removes the biography card that mirrors one background slot's picked type
function syncBiographyCard(slot){

	// searched globally (not scoped to the list) since the reflow logic
	// may have moved this card down into the overflow row
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

	// the picked type may no longer exist in the library (e.g. after
	// importing a background-types file that dropped or renamed it)
	if(!info){
		card.querySelector("h4").textContent = "Неизвестный тип"
		card.querySelector(".cardBody").textContent = ""
		return
	}

	card.querySelector("h4").textContent = info.name

	card.querySelector(".cardBody").textContent = level > 0
		? `${bulletsForLevel(level)} ${info.levels[level - 1]}`
		: "Добавьте точки, чтобы увидеть описание."
}

// (re)populates a background <select>'s options from the current library
function populateBackgroundOptions(select){

	select.innerHTML = ""

	const empty = document.createElement("option")
	empty.value = ""
	empty.textContent = "--"
	select.appendChild(empty)

	for(const key of sortedKeysByName(backgroundTypes, bg => bg.name)){
		const option = document.createElement("option")
		option.value = key
		option.textContent = backgroundTypes[key].name
		select.appendChild(option)
	}
}

// populates a background <select>'s options and wires its change handler
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

// (re)populates the road <select>'s options from the current library
function populateRoadOptions(select){

	select.innerHTML = ""

	const empty = document.createElement("option")
	empty.value = ""
	empty.textContent = "--"
	select.appendChild(empty)

	for(const key of sortedKeysByName(roadTypes, r => r.name)){
		const option = document.createElement("option")
		option.value = key
		option.textContent = roadTypes[key].name
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

// used after importing a library file, keeping the current pick if it's
// still a valid key
function refreshRoadSelectOptions(){

	const current = roadSelect.value
	populateRoadOptions(roadSelect)
	roadSelect.value = current
}

// removing a slot/ability is only allowed once its dots are back to zero,
// so we never have to reconcile a refund across xp/freebie/creation currencies
function removeTrait(trait, type, row){

	if(getTraitValue(trait) > 0){
		alert("Сначала снимите все точки")
		return
	}

	if(type === "disciplines"){
		delete character.disciplines[trait]
	}else if(type === "backgrounds"){

		delete character.backgrounds[trait]

		// the sidebar/overflow card mirrors this slot and won't be cleaned up
		// by the usual background-key loop once the key itself is gone
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

// a small standalone 1-10 dot selector, not tied to any character trait -
// purely descriptive flavor info shown on a discipline card
function createLevelDots(initialLevel, onChange){

	const container = document.createElement("div")
	container.className = "dots"

	for(let i = 0; i < 10; i++){
		const dot = document.createElement("span")
		dot.className = "dot"
		container.appendChild(dot)
	}

	const dotEls = [...container.querySelectorAll(".dot")]

	function render(level){
		dotEls.forEach((dot, i) => dot.classList.toggle("filled", i < level))
	}

	dotEls.forEach((dot, index) => {

		dot.addEventListener("click", () => {

			const current = dotEls.filter(d => d.classList.contains("filled")).length
			const newLevel = (index + 1 === current) ? current - 1 : index + 1

			render(newLevel)
			onChange(newLevel)
		})
	})

	render(initialLevel)

	return container
}

// cards created before the shared power library existed stored their own
// discipline/level/name/description inline - fold that into a fresh library
// entry the first time such a card is rendered, so old saves keep working
function migrateOldCardData(id, data){

	if(data.powerId !== undefined) return

	let powerId = null

	if(data.discipline && data.powerName){

		powerId = `power_${Date.now()}_${Math.floor(Math.random() * 1000)}`

		powerLibrary[powerId] = {
			discipline: disciplineTypes[data.discipline] ? data.discipline : sortedKeysByName(disciplineTypes, d => d.name)[0],
			level: data.level || 1,
			name: data.powerName,
			description: data.powerDescription || ""
		}

		savePowerLibrary()
	}

	character.disciplineCards[id] = { powerId }
	data.powerId = powerId
}

// discipline cards reference one entry from the shared power library (which
// discipline, at what level, its name, its description). Picking
// "+ создать новую силу" opens a small form that saves a brand new entry
// into that library, so the player builds up a reusable catalog through the
// app instead of retyping the same power for every card
function createDisciplineCard(id, data){

	migrateOldCardData(id, data)

	const list = document.getElementById("disciplineCardList")

	const card = document.createElement("div")
	card.className = "card"
	card.dataset.cardId = id
	card.dataset.homeList = "disciplineCardList"

	const removeBtn = document.createElement("button")
	removeBtn.type = "button"
	removeBtn.className = "removeTrait"
	removeBtn.textContent = "×"
	removeBtn.addEventListener("click", () => {
		delete character.disciplineCards[id]
		card.remove()
		updateUI()
		saveCharacter()
	})

	const powerSelect = document.createElement("select")
	const viewBox = document.createElement("div")
	const formBox = document.createElement("div")
	formBox.style.display = "none"

	function refreshOptions(selectedId){

		powerSelect.innerHTML = ""
		powerSelect.appendChild(new Option("-- Выбрать силу --", ""))
		powerSelect.appendChild(new Option("+ Создать новую силу", "__new__"))

		const byDiscipline = {}
		for(const pid in powerLibrary){
			const disc = powerLibrary[pid].discipline
			if(!byDiscipline[disc]) byDiscipline[disc] = []
			byDiscipline[disc].push(pid)
		}

		for(const discKey of sortedKeysByName(disciplineTypes, d => d.name)){

			const ids = byDiscipline[discKey]
			if(!ids || !ids.length) continue

			const group = document.createElement("optgroup")
			group.label = disciplineTypes[discKey].name

			ids
				.sort((a, b) => powerLibrary[a].level - powerLibrary[b].level)
				.forEach(pid => group.appendChild(new Option(`${bulletsForLevel(powerLibrary[pid].level)} ${powerLibrary[pid].name}`, pid)))

			powerSelect.appendChild(group)
		}

		powerSelect.value = selectedId || ""
	}

	function renderView(powerId){

		const p = powerLibrary[powerId]

		viewBox.innerHTML = ""

		if(!p){
			viewBox.style.display = "none"
			return
		}

		viewBox.style.display = ""
		formBox.style.display = "none"

		// the power's name + level already shows as the selected option in
		// powerSelect itself - no need to repeat it here
		const disciplineLine = document.createElement("div")
		disciplineLine.className = "cardDisciplineName"
		disciplineLine.textContent = disciplineTypes[p.discipline]?.name || p.discipline

		const body = document.createElement("div")
		body.className = "cardBody"

		const descPara = document.createElement("p")
		descPara.textContent = p.description
		body.appendChild(descPara)

		if(p.rules){

			const rulesPara = document.createElement("p")
			const rulesLabel = document.createElement("strong")
			rulesLabel.textContent = "Правила:"

			rulesPara.appendChild(rulesLabel)
			rulesPara.appendChild(document.createTextNode(" " + p.rules))

			body.appendChild(rulesPara)
		}

		const deleteBtn = document.createElement("button")
		deleteBtn.type = "button"
		deleteBtn.className = "deletePowerBtn"
		deleteBtn.textContent = "🗑"
		deleteBtn.title = "Удалить силу из библиотеки"
		deleteBtn.addEventListener("click", () => deletePowerFromLibrary(powerId))

		viewBox.appendChild(disciplineLine)
		viewBox.appendChild(body)
		viewBox.appendChild(deleteBtn)
	}

	// the "create a new power" form - filled in once, then saved into the shared library
	const formDisciplineSelect = document.createElement("select")
	for(const key of sortedKeysByName(disciplineTypes, d => d.name)){
		formDisciplineSelect.appendChild(new Option(disciplineTypes[key].name, key))
	}

	const formLevelRow = document.createElement("div")
	formLevelRow.className = "cardLevelRow"
	const formLevelLabel = document.createElement("span")
	formLevelLabel.textContent = "Уровень"
	let formLevel = 1
	const formLevelDots = createLevelDots(formLevel, newLevel => { formLevel = newLevel })
	formLevelRow.appendChild(formLevelLabel)
	formLevelRow.appendChild(formLevelDots)

	const formNameInput = document.createElement("input")
	formNameInput.type = "text"
	formNameInput.maxLength = 100
	formNameInput.placeholder = "Название силы"

	const formDescArea = document.createElement("textarea")
	formDescArea.maxLength = 3000
	formDescArea.placeholder = "Описание силы..."

	const formRulesArea = document.createElement("textarea")
	formRulesArea.maxLength = 3000
	formRulesArea.placeholder = "Правила силы..."

	const saveBtn = document.createElement("button")
	saveBtn.type = "button"
	saveBtn.className = "addSlotBtn"
	saveBtn.textContent = "Сохранить в библиотеку"

	saveBtn.addEventListener("click", () => {

		const name = formNameInput.value.trim()

		if(!name){
			alert("Введите название силы")
			return
		}

		const powerId = `power_${Date.now()}_${Math.floor(Math.random() * 1000)}`

		powerLibrary[powerId] = {
			discipline: formDisciplineSelect.value,
			level: formLevel,
			name,
			description: formDescArea.value,
			rules: formRulesArea.value
		}

		savePowerLibrary()

		character.disciplineCards[id].powerId = powerId
		saveCharacter()

		refreshOptions(powerId)
		renderView(powerId)

		formNameInput.value = ""
		formDescArea.value = ""
		formRulesArea.value = ""

		updateUI()
	})

	formBox.appendChild(formDisciplineSelect)
	formBox.appendChild(formLevelRow)
	formBox.appendChild(formNameInput)
	formBox.appendChild(formDescArea)
	formBox.appendChild(formRulesArea)
	formBox.appendChild(saveBtn)

	powerSelect.addEventListener("change", () => {

		if(powerSelect.value === "__new__"){
			viewBox.style.display = "none"
			formBox.style.display = ""
			return
		}

		character.disciplineCards[id].powerId = powerSelect.value || null
		saveCharacter()

		renderView(powerSelect.value)
		updateUI()
	})

	refreshOptions(data.powerId)
	renderView(data.powerId)

	card.appendChild(removeBtn)
	card.appendChild(powerSelect)
	card.appendChild(viewBox)
	card.appendChild(formBox)

	list.appendChild(card)
}

// re-reads every background <select>'s option list from the library -
// used after importing a background-types file, keeping each select's
// current pick if it's still a valid key
function refreshBackgroundSelectOptions(){

	document.querySelectorAll(".backgroundSelect").forEach(select => {

		const current = select.value
		populateBackgroundOptions(select)
		select.value = current
	})
}

// rebuilds every discipline card from character.disciplineCards - used after
// a library deletion, since each card manages its own select/view state
// internally and there's no other way to make them all notice the change
function rebuildDisciplineCards(){

	document.getElementById("disciplineCardList").innerHTML = ""
	document.getElementById("disciplineOverflowList").innerHTML = ""

	for(const id in character.disciplineCards){
		createDisciplineCard(id, character.disciplineCards[id])
	}

	layoutCards()
}

// deleting a power removes it for every card on every character that
// references it, so it asks for confirmation and then unlinks any card
// here that was pointing at it
function deletePowerFromLibrary(powerId){

	const power = powerLibrary[powerId]
	if(!power) return

	const confirmed = confirm(`Удалить силу "${power.name}" из библиотеки? Она также пропадёт со всех карточек, где выбрана.`)
	if(!confirmed) return

	delete powerLibrary[powerId]
	savePowerLibrary()

	for(const cardId in character.disciplineCards){
		if(character.disciplineCards[cardId].powerId === powerId){
			character.disciplineCards[cardId].powerId = null
		}
	}

	saveCharacter()
	rebuildDisciplineCards()
}

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

document.getElementById("sireNotes").addEventListener("input", (e) => {
	character.sireNotes = e.target.value
	saveCharacter()
})

document.getElementById("addDisciplineCardBtn").addEventListener("click", () => {

	const id = `dcard_${Date.now()}_${Math.floor(Math.random() * 1000)}`

	const data = { powerId: null }
	character.disciplineCards[id] = data

	createDisciplineCard(id, data)

	updateUI()
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

document.getElementById("btnCreation").onclick = () => {
	setState(STATES.CREATE)
	updateUI()
}

document.getElementById("btnFreebie").onclick = () => {
	setState(STATES.FREEBIE)
	updateUI()
}

document.getElementById("btnEdit").onclick = () => {
	setState(STATES.EDIT)
	updateUI()
}

document.getElementById("btnView").onclick = () => {
	setState(STATES.VIEW)
	updateUI()
}

document.getElementById("btnSaveJson").onclick = () => {
	exportCharacterToFile()
}

document.getElementById("btnSaveHtml").onclick = () => {
	exportCharacterToHtml()
}

document.getElementById("btnLoadJson").onclick = () => {
	document.getElementById("loadFileInput").click()
}

document.getElementById("loadFileInput").addEventListener("change", (e) => {

	const file = e.target.files[0]
	if(!file) return

	importCharacterFromFile(file, () => {
		backfillCustomRows()
		updateUI()
		saveCharacter()
	})

	e.target.value = ""
})

document.getElementById("btnSaveLibrary").onclick = () => {
	exportLibraryToFile()
}

document.getElementById("btnLoadLibrary").onclick = () => {
	document.getElementById("loadLibraryInput").click()
}

document.getElementById("loadLibraryInput").addEventListener("change", (e) => {

	const file = e.target.files[0]
	if(!file) return

	importLibraryFromFile(file, () => {
		rebuildDisciplineCards()
		refreshBackgroundSelectOptions()
		refreshRoadSelectOptions()
		refreshClanSelectOptions()
		refreshDisciplineSelectOptions()
		refreshArchetypeSelects()
		updateUI()
		saveCharacter()
	})

	e.target.value = ""
})

clanSelect.addEventListener("change", () => {

	const newClan = clanSelect.value

	// refund all XP and clean up
	refundAllDisciplines()

	// then change the clan
	character.clan = newClan

	// then add new clan disciplines
	fillClanDisciplines()

	updateUI()
	saveCharacter()
})

// (re)populates the clan <select>'s options from the current library
function populateClanOptions(select){

	select.innerHTML = ""

	const empty = document.createElement("option")
	empty.value = ""
	empty.textContent = "-- Выберите клан --"
	select.appendChild(empty)

	for(const key of sortedKeysByName(clans, clan => clan.name)){

		const option = document.createElement("option")
		option.value = key                  // brujah
		option.textContent = clans[key].name // "Бруха"

		select.appendChild(option)
	}
}

// used after importing a library file, keeping the current pick if it's
// still a valid key
function refreshClanSelectOptions(){

	const current = clanSelect.value
	populateClanOptions(clanSelect)
	clanSelect.value = current
}

// nature / demeanor archetypes, alphabetically
function populateArchetypeSelect(select, placeholder){

	select.innerHTML = ""

	const empty = document.createElement("option")
	empty.value = ""
	empty.textContent = placeholder
	select.appendChild(empty)

	for(const key of sortedKeysByName(archetypes, archetype => archetype.name)){
		const option = document.createElement("option")
		option.value = key
		option.textContent = archetypes[key].name
		select.appendChild(option)
	}
}

// used after importing a library file, keeping each select's current pick
// if it's still a valid key
function refreshArchetypeSelects(){

	const nature = natureSelect.value
	const demeanor = demeanorSelect.value

	populateArchetypeSelect(natureSelect, "-- Выберите натуру --")
	populateArchetypeSelect(demeanorSelect, "-- Выберите маску --")

	natureSelect.value = nature
	demeanorSelect.value = demeanor
}

natureSelect.addEventListener("change", () => {
	character.nature = natureSelect.value || null
	saveCharacter()
})

demeanorSelect.addEventListener("change", () => {
	character.demeanor = demeanorSelect.value || null
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

//blood
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

// creates DOM rows for any discipline slot / custom ability that doesn't
// have one yet - safe to call repeatedly (e.g. after loading a new save file)
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
}

// the whole library (power library, background types, road types, clans,
// discipline types, archetypes) must be loaded before any select is
// populated or discipline card rendered, and the character before we know
// which extra discipline slots / custom abilities / cards need building
loadPowerLibrary()
loadBackgroundTypes()
loadRoadTypes()
loadClans()
loadDisciplineTypes()
loadArchetypes()
loadCharacter()

// wire up whatever is already in the static HTML template
document.querySelectorAll(".dots").forEach(setupDotsGroup)
document.querySelectorAll(".disciplineSelect").forEach(setupDisciplineSelect)
document.querySelectorAll(".backgroundSelect").forEach(setupBackgroundSelect)
setupRoadSelect(roadSelect)
populateClanOptions(clanSelect)
populateArchetypeSelect(natureSelect, "-- Выберите натуру --")
populateArchetypeSelect(demeanorSelect, "-- Выберите маску --")

backfillCustomRows()

updateUI()

// the sheet's height (and so how many cards fit beside it) can change on resize
let resizeTimeout
window.addEventListener("resize", () => {
	clearTimeout(resizeTimeout)
	resizeTimeout = setTimeout(layoutCards, 150)
})
