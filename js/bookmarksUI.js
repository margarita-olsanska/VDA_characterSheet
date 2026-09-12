import { character, resetCharacter } from "./character.js"
import { saveCharacter } from "./storage.js"
import { getLocale, setLocale, applyStaticTranslations, t } from "./i18n.js"
import { getState, setState, STATES } from "./state.js"

export function setupBookmarksUI({
	updateUI, hideOverlayScreens, refreshLibraryDependentUI,
	resetCustomRows, backfillCustomRows, saveCharacterSmart
}){

	function applyLanguage(locale){

		setLocale(locale)

		document.querySelectorAll(".langBtn").forEach(btn => btn.classList.remove("active"))
		document.getElementById(locale === "en" ? "btnLangEn" : "btnLangRu").classList.add("active")

		applyStaticTranslations()
		refreshLibraryDependentUI()

		updateUI()
	}

	document.getElementById("btnLangRu").addEventListener("click", () => applyLanguage("ru"))
	document.getElementById("btnLangEn").addEventListener("click", () => applyLanguage("en"))

	document.getElementById(getLocale() === "en" ? "btnLangEn" : "btnLangRu").classList.add("active")

	document.getElementById("btnCreation").onclick = () => {

		if(!confirm(t("creation.confirmNew"))) return

		hideOverlayScreens()

		resetCharacter()
		resetCustomRows()
		backfillCustomRows()

		setState(STATES.CREATE)
		updateUI()
		saveCharacter()
	}

	document.getElementById("btnFreebieStep").onclick = () => {
		hideOverlayScreens()
		setState(getState() === STATES.FREEBIE ? STATES.CREATE : STATES.FREEBIE)
		updateUI()
	}

	document.getElementById("btnFinishCreation").onclick = async () => {

		character.creation.active = false

		const savedToVault = await saveCharacterSmart()

		setState(STATES.EDIT)
		updateUI()
		saveCharacter()

		alert(savedToVault ? t("vault.saved") : t("creation.finished"))
	}

	document.getElementById("btnEditStep").onclick = () => {
		hideOverlayScreens()
		setState(getState() === STATES.EDIT ? STATES.VIEW : STATES.EDIT)
		updateUI()
	}

	document.getElementById("btnView").onclick = () => {
		hideOverlayScreens()
		setState(STATES.VIEW)
		updateUI()
	}

	document.getElementById("btnSaveCurrentCharacter").onclick = async () => {
		if(await saveCharacterSmart()) alert(t("vault.saved"))
	}
}
