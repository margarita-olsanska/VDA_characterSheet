import { character } from "./character.js"
import { clans } from "./clans.js"

export const freebieCosts = {
	attributes: () => 5,
	abilities: () => 2,
	backgrounds: () => 1,
	virtues: () => 2,
	willpower: () => 1,

	disciplines: (level, trait) => {

		const slot = character.disciplines[trait]
		if(!slot || !slot.name) return 0

		const discipline = slot.name
		const clan = clans[character.clan]

		if(clan && clan.disciplines.includes(discipline)){
			return 7   // clan
		}else{
			return 100  // foreign -- TODO: manage this correctly
		}
	}
}