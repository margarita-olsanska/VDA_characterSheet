import { character } from "./character.js"
import { costs } from "./costs.js"
import { freebieCosts } from "./freebieCosts.js"
import { getTraitValue, getTraitType } from "./traits.js"
import { getState, STATES, currentState } from "./state.js"

document.body.dataset.state = getState()

export function renderDots(group, value){
	const dots = group.querySelectorAll(".dot")

	dots.forEach((dot,i) => {
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

	renderCosts()
	renderWillpower()
	
}

export function renderResources(xpInput, freebieInput){
	xpInput.value = character.xp
	freebieInput.value = character.freebie
}