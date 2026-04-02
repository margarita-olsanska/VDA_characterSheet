import { character } from "./character.js"
import { costs } from "./costs.js"
import { getTraitValue, setTraitValue, getTraitType } from "./traits.js"
import { saveCharacter, loadCharacter } from "./storage.js"
import { renderSheet, renderResources } from "./ui.js"
import { clans } from "./clans.js"
import { fillClanDisciplines, refundAllDisciplines } from "./logic.js"
import { disciplines } from "./disciplines.js"
import { getState, setState, STATES, currentState } from "./state.js"

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

document.querySelectorAll(".dots").forEach(group => {

	const trait = group.dataset.trait
	const dots = group.querySelectorAll(".dot")

	dots.forEach((dot,index) => {
		dot.addEventListener("click",()=>{
			if(getState() !== STATES.EDIT){
				return
			}
            console.log("CLICK:", trait, character.disciplines[trait])
			const clickedLevel = index + 1
			const currentLevel = getTraitValue(trait)
			const type = getTraitType(trait)
            
            if(type === "disciplines" && !character.disciplines[trait].name){
                return
            }

			// dots increment
			if(clickedLevel < currentLevel) {

				let refund = 0

				for(let lvl = currentLevel - 1; lvl >= clickedLevel; lvl--){
					refund += costs[type](lvl, trait)
				}

				setTraitValue(trait, clickedLevel)
				character.xp += refund

				updateUI()
				saveCharacter()
				return
			}

			// dots decrement 
			if(clickedLevel > currentLevel) {

				let totalCost = 0

				for(let lvl = currentLevel; lvl < clickedLevel; lvl++){
					totalCost += costs[type](lvl, trait)
				}

				if(character.xp >= totalCost){

					character.xp -= totalCost
					setTraitValue(trait, clickedLevel)

					updateUI()
					saveCharacter()

				}else{
					alert("Недостаточно опыта")
				}

				return
			}

			// clicking on dot -> uncheck
			if(clickedLevel === currentLevel) {

				const refundLevel = currentLevel - 1
				const refund = costs[type](refundLevel, trait)

				setTraitValue(trait, refundLevel)
				character.xp += refund

				updateUI()
				saveCharacter()
			}

		})
	})
})

loadCharacter()
updateUI()