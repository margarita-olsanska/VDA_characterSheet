import { character } from "./character.js"
import { saveCharacter } from "./storage.js"
import { fileToPortraitDataUrl } from "./vault.js"

export function renderPortrait(){

	const img = document.getElementById("portraitImg")
	const placeholder = document.getElementById("portraitPlaceholder")

	if(character.portrait){
		img.src = character.portrait
		img.style.display = ""
		placeholder.style.display = "none"
	}else{
		img.style.display = "none"
		placeholder.style.display = ""
	}
}

export function setupPortraitUI(){

	document.getElementById("portraitBox").addEventListener("click", () => {
		document.getElementById("portraitInput").click()
	})

	document.getElementById("portraitInput").addEventListener("change", async (e) => {

		const file = e.target.files[0]
		if(!file) return

		character.portrait = await fileToPortraitDataUrl(file)

		renderPortrait()
		saveCharacter()

		e.target.value = ""
	})
}
