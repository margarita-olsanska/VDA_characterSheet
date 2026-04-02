import { character } from "./character.js"
import { costs } from "./costs.js"
import { freebieCosts } from "./freebieCosts.js"
import { getTraitValue, getTraitType } from "./traits.js"
import { getState, STATES, currentState } from "./state.js"
import { generationData } from "./generation.js"

document.body.dataset.state = getState()

function getMaxDots(type){

	if(type === "willpower" || type === "road"){
		return 10
	}

	const gen = character.generation
	return generationData[gen].maxTrait
}

export function renderDots(group, value){

	const dots = group.querySelectorAll(".dot")
	const trait = group.dataset.trait
	const type = getTraitType(trait)
	const maxDots = getMaxDots(type)	

	dots.forEach((dot, i) => {

		// скрыть лишние
		dot.style.display = i < maxDots ? "" : "none"

		// заполнение
		dot.classList.toggle("filled", i < value)
	})
}

function getCostFunction(type){

	const state = getState()

	switch(state){

		case STATES.EDIT:
			return (lvl, trait) => costs[type](lvl, trait)

		case STATES.FREEBIE:
			return (lvl, trait) => freebieCosts[type](lvl, trait)

		default:
			return () => 0
	}
}

export function renderCosts(){
	document.querySelectorAll(".dots").forEach(group => {

	const trait = group.dataset.trait
	const type = getTraitType(trait)

	if(!type) return

		const costFunc = getCostFunction(type)

		const dots = group.querySelectorAll(".dot")
		const current = getTraitValue(trait)

		dots.forEach((dot,i) => {

			dot.textContent = ""
			dot.classList.remove("cost")

			if(i >= current){

				let totalCost = 0

				for(let lvl = current; lvl < i; lvl++){
					totalCost += costFunc(lvl, trait)
				}

				totalCost += costFunc(i, trait)

				dot.textContent = totalCost
				dot.classList.add("cost")

				const resource = getState() === STATES.FREEBIE
					? character.freebie
					: character.xp

				dot.style.color = resource < totalCost ? "red" : "green"
			}
		})
	})
}

export function renderWillpower(){

	const checkboxes = document.querySelectorAll(".willpowerCurrent input")

	checkboxes.forEach((cb, i) => {

		// show only max boxes
		cb.style.display = i < character.willpower.level ? "" : "none"

		// check all
		cb.checked = i < character.willpower.current
	})
}

export function renderBlood(){

	const checkboxes = document.querySelectorAll(".bloodPoints input")

	const max = character.blood.max
	const current = character.blood.current

	checkboxes.forEach((cb, i) => {

		cb.style.display = i < max ? "" : "none"
		cb.checked = i < current
	})
}

export function renderBloodInfo(){

	const info = document.getElementById("bloodInfo")
	const gen = character.generation
	const data = generationData[gen]

	info.textContent = `Макс: ${data.bloodPool} | За ход: ${data.perTurn}`
}

export function renderSheet(){

	clanSelect.value = character.clan || ""

	// sync disciplines
	document.querySelectorAll(".disciplineSelect").forEach(select => {

		const slot = select.dataset.slot
		if(!character.disciplines[slot]) return
		select.value = character.disciplines[slot].name || ""
	})

	//dots
	document.querySelectorAll(".dots").forEach(group => {

		const trait = group.dataset.trait
		const value = getTraitValue(trait)

		renderDots(group, value)
	})

	document.querySelectorAll(".willpowerCurrent input").forEach((cb, index) => {

	cb.addEventListener("click", () => {

		const newValue = index + 1

		if(cb.checked){
			character.willpower.current = newValue
		}else{
			character.willpower.current = index
		}

		saveCharacter()
		updateUI()
	})
})

	//blood
	document.querySelectorAll(".bloodPoints input").forEach((cb, index) => {

		cb.addEventListener("click", () => {

			if(cb.checked){
				character.blood.current = index + 1
			}else{
				character.blood.current = index
			}

			saveCharacter()
			updateUI()
		})
	})

	renderCosts()
	renderWillpower()
	renderBlood()
	renderBloodInfo()

}

export function renderResources(xpInput, freebieInput){
	xpInput.value = character.xp
	freebieInput.value = character.freebie
}