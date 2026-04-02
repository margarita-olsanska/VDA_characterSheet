import { character } from "./character.js"
import { freebieCosts } from "./freebieCosts.js"
import { getTraitValue, setTraitValue, getTraitType } from "./traits.js"
import { clans } from "./clans.js"

export function updateFreebie(trait, clickedLevel){

	const currentLevel = getTraitValue(trait)
	const type = getTraitType(trait)

	if(!type) return

	// disciplines without names are ignored
	if(type === "disciplines" && !character.disciplines[trait]?.name){
		return
	}

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
		return
	}

    // clicking on dot -> uncheck
	if(clickedLevel === currentLevel){

		const refundLevel = currentLevel - 1
		const refund = freebieCosts[type](refundLevel, trait)

		setTraitValue(trait, refundLevel)
        character.freebie += refund
	}
}