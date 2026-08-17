import { character } from "./character.js"
import { costs } from "./costs.js"
import { getTraitValue, setTraitValue, getTraitType } from "./traits.js"
import { saveCharacter, loadCharacter } from "./storage.js"
import { renderSheet, renderResources, renderCreation  } from "./ui.js"
import { clans } from "./clans.js"
import {  applyUpgrade, fillClanDisciplines, refundAllDisciplines } from "./logic.js"
import { disciplines } from "./disciplines.js"
import { AppState } from "./state.js"

const xpInput = document.getElementById("xpInput")
const freebieInput = document.getElementById("freebieInput")
const clanSelect = document.getElementById("clanSelect")

function updateUI(){
	renderSheet()
	renderResources(xpInput, freebieInput)
	renderCreation()
}

xpInput.addEventListener("input", () => {
	character.xp = parseInt(xpInput.value) || 0
	saveCharacter()
})

freebieInput.addEventListener("input", () => {
	character.freebie = parseInt(freebieInput.value) || 0
	saveCharacter()
})

document.getElementById("btnCreation").onclick = () => {
	character.state = AppState.CREATION
	updateUI()
}

document.getElementById("btnFreebie").onclick = () => {
	character.state = AppState.FREEBIE
	updateUI()
}

document.getElementById("btnEdir").onclick = () => {
	character.state = AppState.EDIT
	updateUI()
}

document.getElementById("btnView").onclick = () => {
	character.state = AppState.VIEW
	updateUI()
}

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

document.querySelectorAll(".dots").forEach(group => {

	const trait = group.dataset.trait
	const dots = group.querySelectorAll(".dot")

	dots.forEach((dot,index) => {
		dot.addEventListener("click", () => {

			if(character.state === AppState.VIEW)
				return

			const clickedLevel = index + 1

			const result = applyUpgrade(trait, clickedLevel)

			if(!result.success){
				alert("Недостаточно очков")
				return
			}

			updateUI()
			saveCharacter()
		})
	})
})

loadCharacter()
updateUI()