import { character } from "./character.js"

export function saveCharacter() {
	localStorage.setItem("vtmCharacter", JSON.stringify(character))
}

export function loadCharacter() {

	const saved = localStorage.getItem("vtmCharacter")
	if(!saved) return

	const data = JSON.parse(saved)

    Object.assign(character.attributes, data.attributes || {})
    Object.assign(character.abilities, data.abilities || {})
    Object.assign(character.disciplines, data.disciplines || {})
    Object.assign(character.backgrounds, data.backgrounds || {})
    Object.assign(character.virtues, data.virtues || {})
    Object.assign(character.road, data.road || {})
    Object.assign(character.willpower, data.willpower || {})

    character.clan = data.clan || null
    character.xp = data.xp || 0
    character.freebie = data.freebie || 0
}