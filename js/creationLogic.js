import { character } from "./character.js"
import { creationState } from "./creation.js"
import { getTraitType, setTraitValue, getTraitValue, getTraitMin } from "./traits.js"
import { attributeCategories, abilityCategories, getCategory } from "./categories.js"
import { t } from "./i18n.js"

function getPoolTotal(pool){
	return pool.points ?? (pool.primary + pool.secondary + pool.tertiary)
}

export function syncCreationState(){

	for(const category in attributeCategories){
		creationState.attributes.assigned[category] = attributeCategories[category]
			.reduce((sum, trait) => sum + (character.attributes[trait] - getTraitMin("attributes")), 0)
	}
	creationState.attributes.used = Object.values(creationState.attributes.assigned).reduce((a, b) => a + b, 0)

	for(const category in abilityCategories){
		creationState.abilities.assigned[category] = abilityCategories[category]
			.reduce((sum, trait) => sum + character.abilities[trait], 0)
	}

	for(const id in character.customAbilities){
		const custom = character.customAbilities[id]
		creationState.abilities.assigned[custom.category] += custom.level
	}

	creationState.abilities.used = Object.values(creationState.abilities.assigned).reduce((a, b) => a + b, 0)

	creationState.disciplines.used = Object.values(character.disciplines)
		.reduce((sum, slot) => sum + slot.level, 0)

	creationState.backgrounds.used = Object.values(character.backgrounds)
		.reduce((sum, bg) => sum + bg.level, 0)

	creationState.virtues.used = Object.values(character.virtues)
		.reduce((sum, v) => sum + (v - getTraitMin("virtues")), 0)
}

export function createXP(trait, clickedLevel){

	const type = getTraitType(trait)
	const current = getTraitValue(trait)

	if(!type) return

	if(type === "disciplines" && !character.disciplines[trait]?.name){
		return
	}

	if(type === "backgrounds" && !character.backgrounds[trait]?.type){
		return
	}

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

	if(type === "customAbilities"){
		pool = creationState.abilities
		category = character.customAbilities[trait].category
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
		alert(t("alert.noPointsAvailable"))
		return
	}

	pool.used += delta

	if(category){
		pool.assigned[category] += delta
	}

	setTraitValue(trait, clickedLevel)
}
