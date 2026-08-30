export const attributeCategories = {
	physical: ["strength", "dexterity", "stamina"],
	social: ["charisma", "manipulation", "composure"],
	mental: ["wits", "intelligence", "resolve"]
}

export const abilityCategories = {
	talents: ["athletics", "alertness", "brawl", "intimidation", "expression", "leadership", "legerdemain", "subterfuge", "awareness", "empathy"],
	skills: ["archery", "commerce", "survival", "performance", "ride", "animalKen", "crafts", "stealth", "melee", "etiquette"],
	knowledges: ["academics", "law", "medicine", "occult", "politics", "investigation", "enigmas", "hearthWisdom", "seneschal", "theology"]
}

export function getCategory(categories, trait){

	for(const key in categories){
		if(categories[key].includes(trait)) return key
	}

	return null
}
