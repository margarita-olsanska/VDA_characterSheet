import { character } from "./character.js"
import { disciplineTypes } from "./VDA20data.js"
import { saveCharacter } from "./storage.js"
import { t, localize } from "./i18n.js"
import { sortedKeysByName, bulletsForLevel, createLevelDots } from "./utils.js"

function ritualPathDisciplineKeys(){
	return sortedKeysByName(disciplineTypes, d => localize(d.name)).filter(key => disciplineTypes[key].ritualPaths)
}

function createRitualPathController(config, { updateUI }){

	const { library, saveLibrary, cardsKey, refKey, levelMax, hasDescription, hasRules, listId, overflowListId, addBtnId, i18n } = config

	function createCard(id, data){

		const list = document.getElementById(listId)

		const card = document.createElement("div")
		card.className = "card"
		card.dataset.cardId = id
		card.dataset.homeList = listId

		const removeBtn = document.createElement("button")
		removeBtn.type = "button"
		removeBtn.className = "removeTrait"
		removeBtn.textContent = "×"
		removeBtn.addEventListener("click", () => {
			delete character[cardsKey][id]
			card.remove()
			updateUI()
			saveCharacter()
		})

		const entrySelect = document.createElement("select")
		const viewBox = document.createElement("div")
		const formBox = document.createElement("div")
		formBox.style.display = "none"

		function refreshOptions(selectedId){

			entrySelect.innerHTML = ""
			entrySelect.appendChild(new Option(t(`${i18n}.selectPlaceholder`), ""))
			entrySelect.appendChild(new Option(t(`${i18n}.createNew`), "__new__"))

			const byDiscipline = {}
			for(const eid in library){
				const disc = library[eid].discipline
				if(!byDiscipline[disc]) byDiscipline[disc] = []
				byDiscipline[disc].push(eid)
			}

			for(const discKey of ritualPathDisciplineKeys()){

				const ids = byDiscipline[discKey]
				if(!ids || !ids.length) continue

				const group = document.createElement("optgroup")
				group.label = localize(disciplineTypes[discKey].name)

				ids
					.sort((a, b) => library[a].level - library[b].level)
					.forEach(eid => group.appendChild(new Option(`${bulletsForLevel(library[eid].level)} ${library[eid].name}`, eid)))

				entrySelect.appendChild(group)
			}

			entrySelect.value = selectedId || ""
		}

		function renderView(entryId){

			const e = library[entryId]

			viewBox.innerHTML = ""

			if(!e){
				viewBox.style.display = "none"
				return
			}

			viewBox.style.display = ""
			formBox.style.display = "none"

			const disciplineLine = document.createElement("div")
			disciplineLine.className = "cardDisciplineName"
			disciplineLine.textContent = localize(disciplineTypes[e.discipline]?.name) || e.discipline

			viewBox.appendChild(disciplineLine)

			if(hasDescription || hasRules){
				const body = document.createElement("div")
				body.className = "cardBody"

				if(hasDescription){
					const descPara = document.createElement("p")
					descPara.textContent = e.description
					body.appendChild(descPara)
				}

				if(hasRules && e.rules){
					const rulesPara = document.createElement("p")
					const rulesLabel = document.createElement("strong")
					rulesLabel.textContent = t("power.rulesLabel")

					rulesPara.appendChild(rulesLabel)
					rulesPara.appendChild(document.createTextNode(" " + e.rules))

					body.appendChild(rulesPara)
				}

				viewBox.appendChild(body)
			}

			const deleteBtn = document.createElement("button")
			deleteBtn.type = "button"
			deleteBtn.className = "deletePowerBtn"
			deleteBtn.textContent = "🗑"
			deleteBtn.title = t(`${i18n}.deleteTitle`)
			deleteBtn.addEventListener("click", () => deleteFromLibrary(entryId))

			viewBox.appendChild(deleteBtn)
		}

		const formDisciplineSelect = document.createElement("select")
		for(const key of ritualPathDisciplineKeys()){
			formDisciplineSelect.appendChild(new Option(localize(disciplineTypes[key].name), key))
		}

		const formLevelRow = document.createElement("div")
		formLevelRow.className = "cardLevelRow"
		const formLevelLabel = document.createElement("span")
		formLevelLabel.textContent = t(`${i18n}.level`)
		let formLevel = 1
		const formLevelDots = createLevelDots(formLevel, levelMax, newLevel => { formLevel = newLevel })
		formLevelRow.appendChild(formLevelLabel)
		formLevelRow.appendChild(formLevelDots)

		const formNameInput = document.createElement("input")
		formNameInput.type = "text"
		formNameInput.maxLength = 100
		formNameInput.placeholder = t(`${i18n}.namePlaceholder`)

		const formDescArea = hasDescription ? document.createElement("textarea") : null
		if(formDescArea){
			formDescArea.maxLength = 3000
			formDescArea.placeholder = t(`${i18n}.descPlaceholder`)
		}

		const formRulesArea = hasRules ? document.createElement("textarea") : null
		if(formRulesArea){
			formRulesArea.maxLength = 3000
			formRulesArea.placeholder = t(`${i18n}.rulesPlaceholder`)
		}

		const saveBtn = document.createElement("button")
		saveBtn.type = "button"
		saveBtn.className = "addSlotBtn"
		saveBtn.textContent = t("power.saveToLibrary")

		saveBtn.addEventListener("click", () => {

			const name = formNameInput.value.trim()

			if(!name){
				alert(t(`${i18n}.enterName`))
				return
			}

			if(!formDisciplineSelect.value){
				alert(t("ritualPath.noDisciplines"))
				return
			}

			const entryId = `${i18n}_${Date.now()}_${Math.floor(Math.random() * 1000)}`

			library[entryId] = {
				discipline: formDisciplineSelect.value,
				level: formLevel,
				name,
				...(hasDescription ? { description: formDescArea.value } : {}),
				...(hasRules ? { rules: formRulesArea.value, isRitual: true } : {})
			}

			saveLibrary()

			character[cardsKey][id][refKey] = entryId
			saveCharacter()

			refreshOptions(entryId)
			renderView(entryId)

			formNameInput.value = ""
			if(formDescArea) formDescArea.value = ""
			if(formRulesArea) formRulesArea.value = ""

			updateUI()
		})

		formBox.appendChild(formDisciplineSelect)
		formBox.appendChild(formLevelRow)
		formBox.appendChild(formNameInput)
		if(formDescArea) formBox.appendChild(formDescArea)
		if(formRulesArea) formBox.appendChild(formRulesArea)
		formBox.appendChild(saveBtn)

		entrySelect.addEventListener("change", () => {

			if(entrySelect.value === "__new__"){
				viewBox.style.display = "none"
				formBox.style.display = ""
				return
			}

			character[cardsKey][id][refKey] = entrySelect.value || null
			saveCharacter()

			renderView(entrySelect.value)
			updateUI()
		})

		refreshOptions(data[refKey])
		renderView(data[refKey])

		card.appendChild(removeBtn)
		card.appendChild(entrySelect)
		card.appendChild(viewBox)
		card.appendChild(formBox)

		list.appendChild(card)
	}

	function rebuildCards(){

		document.getElementById(listId).innerHTML = ""
		document.getElementById(overflowListId).innerHTML = ""

		for(const id in character[cardsKey]){
			createCard(id, character[cardsKey][id])
		}

		updateUI()
	}

	function deleteFromLibrary(entryId){

		const entry = library[entryId]
		if(!entry) return

		if(!confirm(t(`${i18n}.confirmDelete`, entry.name))) return

		delete library[entryId]
		saveLibrary()

		for(const cardId in character[cardsKey]){
			if(character[cardsKey][cardId][refKey] === entryId){
				character[cardsKey][cardId][refKey] = null
			}
		}

		saveCharacter()
		rebuildCards()
	}

	document.getElementById(addBtnId).addEventListener("click", () => {

		const id = `${i18n}card_${Date.now()}_${Math.floor(Math.random() * 1000)}`

		const data = { [refKey]: null }
		character[cardsKey][id] = data

		createCard(id, data)

		updateUI()
		saveCharacter()
	})

	return { createCard, rebuildCards, deleteFromLibrary }
}

export { ritualPathDisciplineKeys }

export function setupPathRitualCardUI({ updateUI, pathLibrary, savePathLibrary, ritualLibrary, saveRitualLibrary }){

	const paths = createRitualPathController({
		library: pathLibrary, saveLibrary: savePathLibrary,
		cardsKey: "pathCards", refKey: "pathId",
		levelMax: 5, hasDescription: false,
		listId: "pathCardList", overflowListId: "pathOverflowList", addBtnId: "addPathCardBtn",
		i18n: "path"
	}, { updateUI })

	const rituals = createRitualPathController({
		library: ritualLibrary, saveLibrary: saveRitualLibrary,
		cardsKey: "ritualCards", refKey: "ritualId",
		levelMax: 10, hasDescription: true, hasRules: true,
		listId: "ritualCardList", overflowListId: "ritualOverflowList", addBtnId: "addRitualCardBtn",
		i18n: "ritual"
	}, { updateUI })

	return {
		createPathCard: paths.createCard, rebuildPathCards: paths.rebuildCards, deletePathFromLibrary: paths.deleteFromLibrary,
		createRitualCard: rituals.createCard, rebuildRitualCards: rituals.rebuildCards, deleteRitualFromLibrary: rituals.deleteFromLibrary
	}
}
