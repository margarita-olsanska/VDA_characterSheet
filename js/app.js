import { character } from "./character.js"
import { costs } from "./costs.js"
import { getTraitValue, setTraitValue, getTraitType } from "./traits.js"
import { saveCharacter, loadCharacter } from "./storage.js"
import { renderSheet, renderResources } from "./ui.js"

const xpInput = document.getElementById("xpInput")
const freebieInput = document.getElementById("freebieInput")

function updateUI(){
	renderSheet()
	renderResources(xpInput, freebieInput)
}

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
updateUI()