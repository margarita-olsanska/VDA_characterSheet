import { character } from "./character.js"
import { costs } from "./costs.js"
import { getTraitValue, setTraitValue, getTraitType, getTraitMin } from "./traits.js"
import { generationData } from "./generation.js"
import { t } from "./i18n.js"

export function updateXP(trait, clickedLevel){

	const currentLevel = getTraitValue(trait)
	const type = getTraitType(trait)

	if(!type) return

	const gen = character.generation
	const maxTrait = generationData[gen].maxTrait

	if(clickedLevel > maxTrait) return

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
			totalCost += costs[type](lvl, trait)
		}

		if(character.xp < totalCost){
			alert(t("alert.notEnoughXp"))
			return
		}

		character.xp -= totalCost
		setTraitValue(trait, clickedLevel)
		return
	}

	if(clickedLevel < currentLevel){

		let refund = 0

		for(let lvl = currentLevel - 1; lvl >= clickedLevel; lvl--){
			refund += costs[type](lvl, trait)
		}

		setTraitValue(trait, clickedLevel)
		character.xp += refund
	}
}