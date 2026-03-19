import { character } from "./character.js"
import { clans } from "./clans.js"

export const costs = {

	attributes: level => level * 4,

	abilities: level => {
		if(level === 0) return 3
		return level * 2
	},

	disciplines: (level, trait) => {

		const slot = character.disciplines[trait]

		if(!slot || !slot.name) return 0  

		const discipline = slot.name
		const clan = clans[character.clan]

		if(clan && clan.disciplines.includes(discipline)){
			return level === 0 ? 10 : level * 5
		}else{
			return level === 0 ? 15 : level * 7
		}
	},

	backgrounds: level => {
		return 1   // freebie placeholder, TODO:update later
	},

	virtues: level => {
		return level * 2
    }
}
