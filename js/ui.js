import { character } from "./character.js"
import { costs } from "./costs.js"
import { getTraitValue, getTraitType } from "./traits.js"

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

			dot.textContent = ""
			dot.classList.remove("cost")

			if(i >= current){

				let totalCost = 0

				for(let lvl = current; lvl < i; lvl++){
					totalCost += costs[type](lvl)
				}

				totalCost += costs[type](i)

				dot.textContent = totalCost
				dot.classList.add("cost")

				dot.style.color = character.xp < totalCost ? "red" : "green"
			}
		})
	})
}

export function renderSheet(){
	document.querySelectorAll(".dots").forEach(group=>{
		const trait = group.dataset.trait
		const value = getTraitValue(trait)
		renderDots(group,value)
	})

	renderCosts()
}

export function renderResources(xpInput, freebieInput){
	xpInput.value = character.xp
	freebieInput.value = character.freebie
}