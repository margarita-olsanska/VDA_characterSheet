import { character } from "./character.js"
import { costs } from "./costs.js"
import { getTraitValue, getTraitType } from "./traits.js"
import { getState, STATES, currentState } from "./state.js"

document.body.dataset.state = getState()

export function renderDots(group, value){
	const dots = group.querySelectorAll(".dot")

	dots.forEach((dot,i) => {
		dot.classList.toggle("filled", i < value)
	})
}

export function renderCosts(){
	document.querySelectorAll(".dots").forEach(group => {

		const trait = group.dataset.trait
		const dots = group.querySelectorAll(".dot")

		const current = getTraitValue(trait)
		const type = getTraitType(trait)

		dots.forEach((dot,i) => {


			if(type === "disciplines"){
				const discipline = character.disciplines[trait]?.name

				// styling if discipline not selected
				if(!discipline){
					group.style.opacity = 0.3
					// dits without costs
					group.querySelectorAll(".dot").forEach(dot => {
						dot.textContent = ""
						dot.classList.remove("cost", "filled")
					})
					return 
				}

				// if discipline selected - normal styling
				group.style.opacity = 1
			}
			dot.textContent = ""
			dot.classList.remove("cost")

			if (i >= current) {

				let totalCost = 0

				for (let lvl = current; lvl < i; lvl++) {
					totalCost += costs[type](lvl, trait)
				}

				totalCost += costs[type](i, trait)

				dot.textContent = totalCost
				dot.classList.add("cost")

				dot.style.color = character.xp < totalCost ? "red" : "green"
			}
		})
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

	//costs
	renderCosts()
}

export function renderResources(xpInput, freebieInput){
	xpInput.value = character.xp
	freebieInput.value = character.freebie
}