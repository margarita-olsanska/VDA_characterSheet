import { creationState } from "./creation.js"
import { getTraitType, setTraitValue, getTraitValue } from "./traits.js"

export function applyCreationUpgrade(trait, targetLevel){

	const type = getTraitType(trait)
	const current = getTraitValue(trait)

	if(targetLevel <= current) return true

	let pool

	if(type === "attributes"){
		pool = creationState.attributes
	}

	if(type === "abilities"){
		pool = creationState.abilities
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

	if(!pool) return false

	if(pool.used >= pool.points){
		alert("Нет доступных очков")
		return false
	}

	pool.used++
	setTraitValue(trait, targetLevel)

	return true
}