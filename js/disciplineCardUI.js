import { character } from "./character.js"
import { powerLibrary, disciplineTypes } from "./VDA20data.js"
import { saveCharacter, savePowerLibrary } from "./storage.js"
import { t, localize } from "./i18n.js"
import { sortedKeysByName, bulletsForLevel, createLevelDots } from "./utils.js"

function migrateOldCardData(id, data){

	if(data.powerId !== undefined) return

	let powerId = null

	if(data.discipline && data.powerName){

		powerId = `power_${Date.now()}_${Math.floor(Math.random() * 1000)}`

		powerLibrary[powerId] = {
			discipline: disciplineTypes[data.discipline] ? data.discipline : sortedKeysByName(disciplineTypes, d => localize(d.name))[0],
			level: data.level || 1,
			name: data.powerName,
			description: data.powerDescription || ""
		}

		savePowerLibrary()
	}

	character.disciplineCards[id] = { powerId }
	data.powerId = powerId
}

export function setupDisciplineCardUI({ updateUI }){

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
			powerSelect.appendChild(new Option(t("power.selectPlaceholder"), ""))
			powerSelect.appendChild(new Option(t("power.createNew"), "__new__"))

			const byDiscipline = {}
			for(const pid in powerLibrary){
				const disc = powerLibrary[pid].discipline
				if(!byDiscipline[disc]) byDiscipline[disc] = []
				byDiscipline[disc].push(pid)
			}

			for(const discKey of sortedKeysByName(disciplineTypes, d => localize(d.name))){

				const ids = byDiscipline[discKey]
				if(!ids || !ids.length) continue

				const group = document.createElement("optgroup")
				group.label = localize(disciplineTypes[discKey].name)

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

			const disciplineLine = document.createElement("div")
			disciplineLine.className = "cardDisciplineName"
			disciplineLine.textContent = localize(disciplineTypes[p.discipline]?.name) || p.discipline

			const body = document.createElement("div")
			body.className = "cardBody"

			const descPara = document.createElement("p")
			descPara.textContent = p.description
			body.appendChild(descPara)

			if(p.rules){

				const rulesPara = document.createElement("p")
				const rulesLabel = document.createElement("strong")
				rulesLabel.textContent = t("power.rulesLabel")

				rulesPara.appendChild(rulesLabel)
				rulesPara.appendChild(document.createTextNode(" " + p.rules))

				body.appendChild(rulesPara)
			}

			const deleteBtn = document.createElement("button")
			deleteBtn.type = "button"
			deleteBtn.className = "deletePowerBtn"
			deleteBtn.textContent = "🗑"
			deleteBtn.title = t("power.deleteTitle")
			deleteBtn.addEventListener("click", () => deletePowerFromLibrary(powerId))

			viewBox.appendChild(disciplineLine)
			viewBox.appendChild(body)
			viewBox.appendChild(deleteBtn)
		}

		const formDisciplineSelect = document.createElement("select")
		for(const key of sortedKeysByName(disciplineTypes, d => localize(d.name))){
			formDisciplineSelect.appendChild(new Option(localize(disciplineTypes[key].name), key))
		}

		const formLevelRow = document.createElement("div")
		formLevelRow.className = "cardLevelRow"
		const formLevelLabel = document.createElement("span")
		formLevelLabel.textContent = t("power.level")
		let formLevel = 1
		const formLevelDots = createLevelDots(formLevel, 10, newLevel => { formLevel = newLevel })
		formLevelRow.appendChild(formLevelLabel)
		formLevelRow.appendChild(formLevelDots)

		const formNameInput = document.createElement("input")
		formNameInput.type = "text"
		formNameInput.maxLength = 100
		formNameInput.placeholder = t("power.namePlaceholder")

		const formDescArea = document.createElement("textarea")
		formDescArea.maxLength = 3000
		formDescArea.placeholder = t("power.descPlaceholder")

		const formRulesArea = document.createElement("textarea")
		formRulesArea.maxLength = 3000
		formRulesArea.placeholder = t("power.rulesPlaceholder")

		const saveBtn = document.createElement("button")
		saveBtn.type = "button"
		saveBtn.className = "addSlotBtn"
		saveBtn.textContent = t("power.saveToLibrary")

		saveBtn.addEventListener("click", () => {

			const name = formNameInput.value.trim()

			if(!name){
				alert(t("power.enterName"))
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

	function rebuildDisciplineCards(){

		document.getElementById("disciplineCardList").innerHTML = ""
		document.getElementById("disciplineOverflowList").innerHTML = ""

		for(const id in character.disciplineCards){
			createDisciplineCard(id, character.disciplineCards[id])
		}

		updateUI()
	}

	function deletePowerFromLibrary(powerId){

		const power = powerLibrary[powerId]
		if(!power) return

		const confirmed = confirm(t("power.confirmDelete", power.name))
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

	document.getElementById("addDisciplineCardBtn").addEventListener("click", () => {

		const id = `dcard_${Date.now()}_${Math.floor(Math.random() * 1000)}`

		const data = { powerId: null }
		character.disciplineCards[id] = data

		createDisciplineCard(id, data)

		updateUI()
		saveCharacter()
	})

	return { createDisciplineCard, rebuildDisciplineCards, deletePowerFromLibrary }
}
