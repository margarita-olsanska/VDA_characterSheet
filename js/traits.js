import { character } from "./character.js"

export function getTraitType(trait) {

	if(character.attributes[trait] !== undefined) return "attributes"
	if(character.abilities[trait] !== undefined) return "abilities"
	if(character.clanDiscipline[trait] !== undefined) return "clanDiscipline"
	if(character.foreignDiscipline[trait] !== undefined) return "foreignDiscipline"
	if(character.backgrounds[trait] !== undefined) return "backgrounds"
	if(character.virtues[trait] !== undefined) return "virtues"

	console.warn("Unknown trait:", trait)
	return null
}

export function getTraitValue(trait) {

	const type = getTraitType(trait)
	return type ? character[type][trait] : 0
}

export function setTraitValue(trait, value) {

	const type = getTraitType(trait)
	if(type) character[type][trait] = value
}