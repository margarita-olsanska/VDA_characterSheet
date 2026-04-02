import { character } from "./character.js"

export function getTraitType(trait){

	for(const cat in character.attributes){
		if(character.attributes[cat][trait] !== undefined){
			return "attributes"
		}
	}

	for(const cat in character.abilities){
		if(character.abilities[cat][trait] !== undefined){
			return "abilities"
		}
	}

	if(character.disciplines?.[trait]) return "disciplines"
	if(character.backgrounds?.[trait] !== undefined) return "backgrounds"
	if(character.virtues?.[trait] !== undefined) return "virtues"

	if(trait === "road") return "road"
	if(trait === "willpower") return "willpower"

	return null
}

export function getTraitValue(trait){

	// attributes
	for(const cat in character.attributes){
		if(character.attributes[cat][trait] !== undefined){
			return character.attributes[cat][trait]
		}
	}

	// abilities
	for(const cat in character.abilities){
		if(character.abilities[cat][trait] !== undefined){
			return character.abilities[cat][trait]
		}
	}

	// остальное как было
	if(character.disciplines?.[trait])
		return character.disciplines[trait].level

	if(character.backgrounds?.[trait] !== undefined)
		return character.backgrounds[trait]

	if(character.virtues?.[trait] !== undefined)
		return character.virtues[trait]

	if(trait === "road")
		return character.road.level

	if(trait === "willpower")
		return character.willpower.max

	return 0
}


export function setTraitValue(trait, value){

	// attributes
	for(const cat in character.attributes){
		if(character.attributes[cat][trait] !== undefined){
			character.attributes[cat][trait] = value
			return
		}
	}

	// abilities
	for(const cat in character.abilities){
		if(character.abilities[cat][trait] !== undefined){
			character.abilities[cat][trait] = value
			return
		}
	}

	// остальное
	if(character.disciplines?.[trait]){
		character.disciplines[trait].level = value
		return
	}

	if(character.backgrounds?.[trait] !== undefined){
		character.backgrounds[trait] = value
		return
	}

	if(character.virtues?.[trait] !== undefined){
		character.virtues[trait] = value
		return
	}

	if(trait === "road"){
		character.road.level = value
		return
	}

	if(trait === "willpower"){
		character.willpower.max = value
		return
	}
}
