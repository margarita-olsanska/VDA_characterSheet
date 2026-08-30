import { character } from "./character.js"
import { creationState } from "./creation.js"
import { getTraitType, setTraitValue, getTraitValue, getTraitMin } from "./traits.js"
import { attributeCategories, abilityCategories, getCategory } from "./categories.js"

function getPoolTotal(pool){
	return pool.points ?? (pool.primary + pool.secondary + pool.tertiary)
}

export function createXP(trait, clickedLevel){

	const type = getTraitType(trait)
	const current = getTraitValue(trait)

	if(!type) return

	// disciplines without names are ignored
	if(type === "disciplines" && !character.disciplines[trait]?.name){
		return
	}

	// clicking the currently topmost filled dot removes it
	if(clickedLevel === current) clickedLevel = Math.max(current - 1, getTraitMin(type))

	let pool
	let category = null

	if(type === "attributes"){
		pool = creationState.attributes
		category = getCategory(attributeCategories, trait)
	}

	if(type === "abilities"){
		pool = creationState.abilities
		category = getCategory(abilityCategories, trait)
	}

	if(type === "disciplines"){
		pool = creationState.disciplines
	}

	if(type === "backgrounds"){
		pool = creationState.backgrounds
	}

	if(type === "virtues"){
		pool = creationState.virtues
	}

	if(!pool) return

	const delta = clickedLevel - current

	if(delta > 0 && pool.used + delta > getPoolTotal(pool)){
		alert("Нет доступных очков")
		return
	}

	pool.used += delta

	if(category){
		pool.assigned[category] += delta
	}

	setTraitValue(trait, clickedLevel)
}
