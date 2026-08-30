import { creationState } from "./creation.js"
import { getTraitType, setTraitValue, getTraitValue, getTraitMin } from "./traits.js"
import { attributeCategories, abilityCategories, getCategory } from "./categories.js"

function getPoolTotal(pool){
	return pool.points ?? (pool.primary + pool.secondary + pool.tertiary)
}

export function applyCreationUpgrade(trait, targetLevel){

	const type = getTraitType(trait)
	const current = getTraitValue(trait)

	// clicking the currently topmost filled dot removes it
	if(targetLevel === current) targetLevel = Math.max(current - 1, getTraitMin(type))

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

	if(!pool) return { success: false }

	const delta = targetLevel - current

	if(delta > 0 && pool.used + delta > getPoolTotal(pool)){
		return { success: false }
	}

	pool.used += delta

	if(category){
		pool.assigned[category] += delta
	}

	setTraitValue(trait, targetLevel)

	return { success: true }
}