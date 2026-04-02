import { character } from "./character.js"
import { costs } from "./costs.js"
import { getTraitValue, setTraitValue, getTraitType } from "./traits.js"
import { saveCharacter, loadCharacter } from "./storage.js"
import { renderSheet, renderResources } from "./ui.js"
import { clans } from "./clans.js"
import { fillClanDisciplines, refundAllDisciplines } from "./logic.js"
import { disciplines } from "./disciplines.js"
import { getState, setState, STATES, currentState } from "./state.js"
import { updateXP } from "./editLogic.js"

const xpInput = document.getElementById("xpInput")
const freebieInput = document.getElementById("freebieInput")
const clanSelect = document.getElementById("clanSelect")
const editBtn = document.getElementById("editModeBtn")

editBtn.addEventListener("click", () => {
	console.log("CURRENT STATE:", getState())
	setState(STATES.EDIT)
	updateUI()
})

function updateUI(){
	renderSheet()
	renderResources(xpInput, freebieInput)
}

xpInput.addEventListener("input", () => {
	character.xp = parseInt(xpInput.value) || 0
	saveCharacter()
})

freebieInput.addEventListener("input", () => {
	character.freebie = parseInt(freebieInput.value) || 0
	saveCharacter()
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


//empty
const empty = document.createElement("option")
empty.value = ""
empty.textContent = "-- Выберите клан --"
clanSelect.appendChild(empty)

// all clans
for(const key in clans){

	const option = document.createElement("option")
	option.value = key                  // brujah
	option.textContent = clans[key].name // "Бруха"

	clanSelect.appendChild(option)
}

document.querySelectorAll(".disciplineSelect").forEach(select => {

	//empty
	const empty = document.createElement("option")
	empty.value = ""
	empty.textContent = "--"
	select.appendChild(empty)

	for(const key in disciplines){
		const option = document.createElement("option")
		option.value = key
		option.textContent = disciplines[key] // russian text
		select.appendChild(option)
	}
})

document.querySelectorAll(".disciplineSelect").forEach(select => {

	select.addEventListener("change", () => {

		const slot = select.dataset.slot
		const value = select.value

		character.disciplines[slot].name = value

		updateUI()
		saveCharacter()
	})
})

function handleXP(trait, level){

	switch(getState()){

		case STATES.EDIT:
			return updateXP(trait, level)

		// case STATES.FREEBIE:
		// 	return freebieXP(trait, level)

		// case STATES.CREATE:
		// 	return createXP(trait, level)

		default:
			return // ничего не делаем
	}
}


document.querySelectorAll(".dots").forEach(group => {

	const trait = group.dataset.trait
	const dots = group.querySelectorAll(".dot")

	dots.forEach((dot,index) => {

		dot.addEventListener("click", () => {

			const clickedLevel = index + 1

			handleXP(trait, clickedLevel)

			updateUI()
			saveCharacter()
		})
	})
})


loadCharacter()
updateUI()