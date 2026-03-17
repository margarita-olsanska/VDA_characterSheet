
const character = {
	attributes: {
		strength: 1,
		dexterity: 1,
		stamina: 1,

		charisma: 1,
		manipulation: 1,
		composure: 1,

		wits: 1,
		intelligence: 1,
		resolve: 1
	},

	abilities: {
		athletics: 0,
		alertness: 0,
		brawl: 0,
		intimidation: 0,
		expression: 0,
		leadership: 0,
		legerdemain: 0,
		subterfuge: 0,
		awareness: 0,
		empathy: 0,

		archery: 0,
		commerce: 0,
		survival: 0,
		performance: 0,
		ride: 0,
		animalKen: 0,
		crafts: 0,
		stealth: 0,
		melee: 0,
		etiquette: 0,
		
		academics: 0,
		law: 0,
		medicine: 0,
		occult: 0,
		politics: 0,
		investigation: 0,
		enigmas: 0,
		hearthWisdom: 0,
		seneschal: 0,
		theology: 0
	},

	clanDiscipline: {
		clanDiscipline1: '',
		clanDiscipline2: '',
		clanDiscipline3: '',
	},

	foreignDiscipline: {
		foreignDiscipline1: '',
		foreignDiscipline2: '',
		foreignDiscipline3: ''
	},

	backgrounds: {
		background1: '',
		background2: '',
		background3: '',
		background4: '',
		background5: '',
		background6: ''
	},

	virtues: {
		virtue1: 1,
		virtue2: 1,
		virtue3: 1
	},

	bloodPoints: 0,
	maxBloodPoints: 1,

	willpowerPoints: 0,
	maxWillpowerPoints: 1,

	healthPoints: 0,
	maxHealthPoints: 1,

	xp: 0,
	freebie: 0,
}

const costs = {

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

function renderCosts() {

	document.querySelectorAll(".dots").forEach(group => {

		const trait = group.dataset.trait
		const dots = group.querySelectorAll(".dot")

		const current = getTraitValue(trait)
		const type = getTraitType(trait)

		dots.forEach((dot,i) => {

			dot.textContent = ""
			dot.classList.remove("cost")

			if (i >= current) {

				let totalCost = 0

				for (let lvl = current; lvl < i; lvl++) {
					totalCost += costs[type](lvl)
				}

				totalCost += costs[type](i)

				dot.textContent = totalCost
				dot.classList.add("cost")

				dot.style.color = character.xp < totalCost ? "red" : "green"
			}
		})
	})
}

function renderDots(group,value){

	const dots = group.querySelectorAll(".dot")
	
	dots.forEach((dot,i) => {
		dot.classList.toggle("filled", i < value)
	})
}

function renderResources() {

	xpInput.value = character.xp
	freebieInput.value = character.freebie
}

function renderSheet() {

	document.querySelectorAll(".dots").forEach(group=>{
		const trait = group.dataset.trait
		const value = getTraitValue(trait)
		renderDots(group,value)
	})
	renderCosts()
}

function getTraitType(trait) {

	if(character.attributes.hasOwnProperty(trait))
		return "attributes"

	if(character.abilities.hasOwnProperty(trait))
		return "abilities"

	if(character.clanDiscipline.hasOwnProperty(trait))
		return "clanDiscipline"

	if(character.foreignDiscipline.hasOwnProperty(trait))
		return "foreignDiscipline"

	if(character.backgrounds.hasOwnProperty(trait))
		return "backgrounds"

	if(character.virtues.hasOwnProperty(trait))
		return "virtues"

	console.warn("Unknown trait:", trait)
	return null
}

function getTraitValue(trait) {

	if(character.attributes.hasOwnProperty(trait))
		return character.attributes[trait]

	if(character.abilities.hasOwnProperty(trait))
		return character.abilities[trait]

	if(character.clanDiscipline.hasOwnProperty(trait))
		return character.clanDiscipline[trait]

	if(character.foreignDiscipline.hasOwnProperty(trait))
		return character.foreignDiscipline[trait]

	if(character.backgrounds.hasOwnProperty(trait))
		return character.backgrounds[trait]

	if(character.virtues.hasOwnProperty(trait))
		return character.virtues[trait]

	return 0
}

function setTraitValue(trait,value) {

	if(character.attributes.hasOwnProperty(trait))
		character.attributes[trait] = value

	else if(character.abilities.hasOwnProperty(trait))
		character.abilities[trait] = value

	else if(character.clanDiscipline.hasOwnProperty(trait))
		character.clanDiscipline[trait] = value

	else if(character.foreignDiscipline.hasOwnProperty(trait))
		character.foreignDiscipline[trait] = value

	else if(character.backgrounds.hasOwnProperty(trait))
		character.backgrounds[trait] = value

	else if(character.virtues.hasOwnProperty(trait))
		character.virtues[trait] = value
}

function getCost(trait) {

	const type = getTraitType(trait)
	const level = getTraitValue(trait)

	if(!type || !costs[type]){
		console.error("No cost for", trait, type)
		return 0
	}

	return costs[type](level)
}

function getCosts(currentLevel) {

	const nextLevel = currentLevel + 1
	return costs.attributes.xp(nextLevel)

}

function upgradeAttribute(trait) {
	
	const price = getCosts(trait)
	if(character.xp >= price.xp){

		character.xp -= price.xp
		character.attributes[trait]++

		updateUI()
		saveCharacter()
	}
}

function saveCharacter() {
	localStorage.setItem("vtmCharacter", JSON.stringify(character))
}

function loadCharacter() {

	const saved = localStorage.getItem("vtmCharacter")
	if(!saved) return

	const data = JSON.parse(saved)

	// только известные поля
	Object.assign(character.attributes, data.attributes || {})
	Object.assign(character.abilities, data.abilities || {})
	Object.assign(character.clanDiscipline, data.clanDiscipline || {})
	Object.assign(character.foreignDiscipline, data.foreignDiscipline || {})
	Object.assign(character.backgrounds, data.backgrounds || {})
	Object.assign(character.virtues, data.virtues || {})

	character.xp = data.xp || 0
	character.freebie = data.freebie || 0
}

function updateUI() {

	renderSheet()
	renderResources()
}

xpInput = document.getElementById("xpInput")
freebieInput = document.getElementById("freebieInput")

xpInput.addEventListener("input", () => {
	character.xp = parseInt(xpInput.value) || 0
	saveCharacter()
})

freebieInput.addEventListener("input", () => {
	character.freebie = parseInt(freebieInput.value) || 0
	saveCharacter()
})

document.querySelectorAll(".dots").forEach(group => {

	const trait = group.dataset.trait
	const dots = group.querySelectorAll(".dot")

	dots.forEach((dot,index) => {
		dot.addEventListener("click",()=>{

			const clickedLevel = index + 1
			const currentLevel = getTraitValue(trait)
			const type = getTraitType(trait)

			// УМЕНЬШЕНИЕ
			if(clickedLevel < currentLevel) {

				let refund = 0

				for(let lvl = currentLevel - 1; lvl >= clickedLevel; lvl--){
					refund += costs[type](lvl)
				}

				setTraitValue(trait, clickedLevel)
				character.xp += refund

				updateUI()
				saveCharacter()
				return
			}

			// УВЕЛИЧЕНИЕ 
			if(clickedLevel > currentLevel) {

				let totalCost = 0

				for(let lvl = currentLevel; lvl < clickedLevel; lvl++){
					totalCost += costs[type](lvl)
				}

				if(character.xp >= totalCost){

					character.xp -= totalCost
					setTraitValue(trait, clickedLevel)

					updateUI()
					saveCharacter()

				}else{
					alert("Недостаточно опыта")
				}

				return
			}

			// Клик по текущей точке (−1 уровень)
			if(clickedLevel === currentLevel) {

				const refundLevel = currentLevel - 1
				const refund = costs[type](refundLevel)

				setTraitValue(trait, refundLevel)
				character.xp += refund

				updateUI()
				saveCharacter()
			}

		})
	})
})

loadCharacter()
renderSheet()
renderResources()