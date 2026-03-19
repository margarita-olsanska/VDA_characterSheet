import { character } from "./character.js"

export function getTraitType(trait) {

	if(character.attributes[trait] !== undefined) return "attributes"
	if(character.abilities[trait] !== undefined) return "abilities"
    if(character.disciplines[trait] !== undefined) return "disciplines"
	if(character.backgrounds[trait] !== undefined) return "backgrounds"
	if(character.virtues[trait] !== undefined) return "virtues"

	console.warn("Unknown trait:", trait)
	return null
}

export function getTraitValue(trait) {

	const type = getTraitType(trait)

	if(type === "disciplines"){
		return character.disciplines[trait].level
	}

	if(!type || !character[type]) return 0

	return character[type][trait] ?? 0
}

export function setTraitValue(trait, value) {

	const type = getTraitType(trait)

	if(type === "disciplines"){
		character.disciplines[trait].level = value
		return
	}

	if(type && character[type]){
		character[type][trait] = value
	}
}