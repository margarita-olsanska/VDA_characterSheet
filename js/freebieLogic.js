import { character } from "./character.js"
import { freebieCosts } from "./freebieCosts.js"
import { getTraitValue, setTraitValue, getTraitType, getTraitMin } from "./traits.js"
import { t } from "./i18n.js"

export function updateFreebie(trait, clickedLevel){

	const currentLevel = getTraitValue(trait)
	const type = getTraitType(trait)

	if(!type) return

	if(type === "disciplines" && !character.disciplines[trait]?.name){
		return
	}

	if(type === "backgrounds" && !character.backgrounds[trait]?.type){
		return
	}

	if(clickedLevel === currentLevel) clickedLevel = Math.max(currentLevel - 1, getTraitMin(type))

	if(clickedLevel > currentLevel){

		let totalCost = 0

		for(let lvl = currentLevel; lvl < clickedLevel; lvl++){
			totalCost += freebieCosts[type](lvl, trait)
		}

		if(character.freebie < totalCost){
			alert(t("alert.notEnoughFreebie"))
			return
		}

		character.freebie -= totalCost
		setTraitValue(trait, clickedLevel)
		return
	}

	if(clickedLevel < currentLevel){

		let refund = 0

		for(let lvl = currentLevel - 1; lvl >= clickedLevel; lvl--){
			refund += freebieCosts[type](lvl, trait)
		}

		setTraitValue(trait, clickedLevel)
		character.freebie += refund
	}
}