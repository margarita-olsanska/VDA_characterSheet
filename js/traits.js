import { character } from "./character.js"

export function getTraitType(trait) {

	if(character.attributes[trait] !== undefined) return "attributes"
	if(character.abilities[trait] !== undefined) return "abilities"
	if(character.customAbilities[trait] !== undefined) return "customAbilities"
    if(character.disciplines[trait] !== undefined) return "disciplines"
	if(character.backgrounds[trait] !== undefined) return "backgrounds"
	if(character.virtues[trait] !== undefined) return "virtues"
	if(trait === "road") return "road"
	if(trait === "willpower") return "willpower"

	console.warn("Unknown trait:", trait)
	return null
}

export function getTraitValue(trait) {

	const type = getTraitType(trait)

	if(type === "disciplines"){
		return character.disciplines[trait].level
	}

	if(type === "customAbilities"){
		return character.customAbilities[trait].level
	}

	if(type === "backgrounds"){
		return character.backgrounds[trait].level
	}

	if(!type || !character[type]) return 0

	if(type === "road"){
		return character.road.level
	}

	if(type === "willpower"){
		return character.willpower.level
	}

	return character[type][trait] ?? 0
}

export function getTraitMin(type) {
	return (type === "attributes" || type === "virtues") ? 1 : 0
}

export function getTraitCeiling(type) {
	return (type === "backgrounds" || type === "virtues") ? 5 : 10
}

export function setTraitValue(trait, value) {

	const type = getTraitType(trait)

	if(type === "disciplines"){
		character.disciplines[trait].level = value
		return
	}

	if(type === "customAbilities"){
		character.customAbilities[trait].level = value
		return
	}

	if(type === "backgrounds"){
		character.backgrounds[trait].level = value
		return
	}

	if(type && character[type]){
		character[type][trait] = value
	}

	if(type === "road"){
		character.road.level = value
		return
	}

	if(type === "willpower"){
		character.willpower.level = value

		if(character.willpower.current > value){
			character.willpower.current = value
		}

	return
}
}