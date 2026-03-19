export const costs = {

	attributes: level => level * 4,

	abilities: level => {
		if(level === 0) return 3
		return level * 2
	},

	clanDiscipline: level => {
		if(level === 0) return 10
		return level * 5
	},

	foreignDiscipline: level => {
		if(level === 0) return 15
		return level * 7
	},

	backgrounds: level => {
		return 1   // freebie placeholder, TODO:update later
	},

	virtues: level => {
		return level * 2
    }
}
