import { character } from "./character.js"
import { freebieCosts } from "./freebieCosts.js"
import { getTraitValue, setTraitValue, getTraitType, getTraitMin } from "./traits.js"

export function updateFreebie(trait, clickedLevel){

	const currentLevel = getTraitValue(trait)
	const type = getTraitType(trait)

	if(!type) return

	// disciplines without names are ignored
	if(type === "disciplines" && !character.disciplines[trait]?.name){
		return
	}

	// clicking the currently topmost filled dot removes it
	if(clickedLevel === currentLevel) clickedLevel = Math.max(currentLevel - 1, getTraitMin(type))

	// dots increment
	if(clickedLevel > currentLevel){

		let totalCost = 0

		for(let lvl = currentLevel; lvl < clickedLevel; lvl++){
			totalCost += freebieCosts[type](lvl, trait)
		}

		if(character.freebie < totalCost){
			alert("Недостаточно freebie points")
			return
		}

		character.freebie -= totalCost
		setTraitValue(trait, clickedLevel)
		return
	}

	// dots decrement
	if(clickedLevel < currentLevel){

		let refund = 0

		for(let lvl = currentLevel - 1; lvl >= clickedLevel; lvl--){
			refund += freebieCosts[type](lvl, trait)
		}

		setTraitValue(trait, clickedLevel)
		character.freebie += refund
	}
}