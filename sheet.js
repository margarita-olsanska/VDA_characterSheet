
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

	disciplines: {
		clanDiscipline1: '',
		clanDiscipline2: '',
		clanDiscipline3: '',
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

document.querySelectorAll(".dots").forEach(group => {

	const trait = group.dataset.trait
	const dots = group.querySelectorAll(".dot")

	dots.forEach((dot,index)=>{
		dot.addEventListener("click",()=>{
			const value = index + 1
			character.attributes[trait] = value
			renderDots(group,value)
			saveCharacter()
		})
	})
})


function renderDots(group,value){

	const dots = group.querySelectorAll(".dot")
	
	dots.forEach((dot,i)=>{
		dot.classList.toggle("filled", i < value)
	})
}


function saveCharacter(){
	localStorage.setItem("vtmCharacter", JSON.stringify(character))
}

function loadCharacter(){

	const saved = localStorage.getItem("vtmCharacter")
	if(saved){
		Object.assign(character, JSON.parse(saved))
	}
}

function renderSheet(){

	document.querySelectorAll(".dots").forEach(group=>{
		const trait = group.dataset.trait
		const value = character.attributes[trait]
		renderDots(group,value)
	})
}

loadCharacter()
renderSheet()