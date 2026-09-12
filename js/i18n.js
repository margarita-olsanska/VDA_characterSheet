
const LOCALE_KEY = "vtmLocale"

let currentLocale = localStorage.getItem(LOCALE_KEY) || "en"

export function getLocale(){
	return currentLocale
}

export function setLocale(locale){
	currentLocale = locale
	localStorage.setItem(LOCALE_KEY, locale)
}

export function localize(field){

	if(field == null) return ""
	if(typeof field === "string") return field

	return field[currentLocale] ?? field.ru ?? ""
}

export function t(key, ...vars){

	const entry = strings[key]
	let text = entry ? (entry[currentLocale] ?? entry.ru ?? key) : key

	vars.forEach(value => { text = text.replace("%s", value) })

	return text
}

export function applyStaticTranslations(){

	document.documentElement.lang = currentLocale

	document.querySelectorAll("[data-i18n]").forEach(el => {
		el.textContent = t(el.dataset.i18n)
	})

	document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
		el.placeholder = t(el.dataset.i18nPlaceholder)
	})

	document.querySelectorAll("[data-i18n-title]").forEach(el => {
		el.title = t(el.dataset.i18nTitle)
	})
}

const strings = {

	"tab.creation": { ru: "Создание персонажа", en: "Character Creation" },
	"action.toFreebie": { ru: "Далее: свободные очки", en: "Next: Freebie Points" },
	"action.backToCreation": { ru: "Назад: точки", en: "Back: Dots" },
	"action.finishCreation": { ru: "Завершить создание", en: "Finish Creation" },
	"creation.confirmNew": {
		ru: "Начать нового персонажа? Все несохранённые изменения текущего будут потеряны.",
		en: "Start a new character? Any unsaved changes to the current one will be lost."
	},
	"creation.finished": { ru: "Создание персонажа завершено.", en: "Character creation finished." },
	"tab.view": { ru: "Персонаж", en: "Character" },
	"action.toEdit": { ru: "Прокачка", en: "Advancement" },
	"action.backToView": { ru: "Назад: просмотр", en: "Back: View" },
	"action.saveHtml": { ru: "Экспортировать лист персонажа (.html)", en: "Export Character Sheet (.html)" },
	"action.exportCharacter": { ru: "Экспортировать персонажа", en: "Export Character" },
	"action.importCharacter": { ru: "Импортировать персонажа", en: "Import Character" },
	"action.exportLibrary": { ru: "Экспортировать библиотеку", en: "Export Library" },
	"action.importLibrary": { ru: "Импортировать библиотеку", en: "Import Library" },
	"tab.vault": { ru: "Хранилище", en: "Vault" },
	"tab.library": { ru: "Библиотека", en: "Library" },

	"library.heading": { ru: "Библиотека", en: "Library" },
	"library.presetLabel": { ru: "Библиотека:", en: "Library:" },
	"library.presetBuiltinGroup": { ru: "Стандартные", en: "Built-in" },
	"library.presetCustomGroup": { ru: "Пользовательские", en: "Custom" },
	"library.saveAsPreset": { ru: "Сохранить как новую библиотеку", en: "Save as New Library" },
	"library.resetToDefault": { ru: "Сбросить к стандартным", en: "Reset to Default" },
	"library.savePresetPrompt": { ru: "Введите название новой библиотеки:", en: "Enter a name for the new library:" },
	"library.presetSaveFailed": { ru: "Не удалось сохранить библиотеку - подключите папку персонажей.", en: "Couldn't save the library - connect a characters folder first." },
	"library.confirmResetPreset": {
		ru: "Сбросить эту библиотеку к стандартным значениям? Все изменения будут потеряны.",
		en: "Reset this library to its defaults? All changes will be lost."
	},
	"library.deletePreset": { ru: "Удалить библиотеку", en: "Delete Library" },
	"library.confirmDeletePreset": { ru: "Удалить библиотеку \"%s\"? Это действие нельзя отменить.", en: "Delete library \"%s\"? This can't be undone." },
	"library.attributes": { ru: "Характеристики", en: "Attributes" },
	"library.archetypes": { ru: "Архетипы (натуры/маски)", en: "Archetypes (Natures/Demeanors)" },
	"library.clans": { ru: "Кланы", en: "Clans" },
	"library.abilities": { ru: "Способности", en: "Abilities" },
	"library.powers": { ru: "Силы дисциплин", en: "Discipline Powers" },
	"library.namePlaceholder": { ru: "Название", en: "Name" },
	"library.descPlaceholder": { ru: "Описание", en: "Description" },
	"library.level1": { ru: "Уровень 1", en: "Level 1" },
	"library.level2": { ru: "Уровень 2", en: "Level 2" },
	"library.level3": { ru: "Уровень 3", en: "Level 3" },
	"library.level4": { ru: "Уровень 4", en: "Level 4" },
	"library.level5": { ru: "Уровень 5", en: "Level 5" },
	"library.add": { ru: "+ Добавить", en: "+ Add" },
	"library.sinsOptional": { ru: "Таблица грехов необязательна - можно оставить пустой.", en: "The sins table is optional - you can leave it blank." },
	"library.roadParentLabel": { ru: "Родительская дорога", en: "Parent Road" },
	"library.roadParentNone": { ru: "-- обычная дорога, без родителя --", en: "-- plain road, no parent --" },
	"library.pathOf": { ru: "путь дороги", en: "path of" },
	"library.overridesNote": {
		ru: "Заполняйте только те строки, которые должны отличаться от родительской дороги - остальные наследуются от неё.",
		en: "Only fill in the rows that should differ from the parent road - the rest are inherited from it."
	},
	"library.empty": { ru: "Пока пусто.", en: "Nothing here yet." },
	"library.enterName": { ru: "Введите название", en: "Enter a name" },
	"library.confirmDelete": { ru: "Удалить \"%s\" из библиотеки?", en: "Delete \"%s\" from the library?" },
	"library.renamePrompt": { ru: "Новое название:", en: "New name:" },

	"vault.heading": { ru: "Хранилище персонажей", en: "Character Vault" },
	"vault.indexedDbNote": {
		ru: "Ваш браузер не поддерживает выбор папки на диске, поэтому персонажи хранятся в данных этого браузера (не как файлы). В Chrome или Edge можно подключить настоящую папку characters.",
		en: "Your browser can't pick a real folder, so characters are stored in this browser's own data instead of files. Chrome or Edge can connect a real characters folder."
	},
	"vault.connect": { ru: "Открыть папку персонажей", en: "Open characters folder" },
	"vault.saveCurrent": { ru: "Сохранить персонажа", en: "Save character" },
	"vault.empty": { ru: "В папке characters пока нет персонажей.", en: "No characters in the folder yet." },
	"vault.noPortrait": { ru: "Нет фото", en: "No photo" },
	"vault.uploadPortrait": { ru: "Загрузить портрет", en: "Upload portrait" },
	"vault.delete": { ru: "Удалить персонажа из хранилища", en: "Delete character from vault" },
	"vault.confirmDelete": { ru: "Удалить персонажа \"%s\" из хранилища?", en: "Delete \"%s\" from the vault?" },
	"vault.saved": { ru: "Персонаж сохранён в хранилище.", en: "Character saved to the vault." },
	"vault.connectFailed": { ru: "Не удалось открыть папку персонажей.", en: "Couldn't open the characters folder." },
	"vault.connectPrompt": {
		ru: "Сохранить персонажа в папку хранилища? Понадобится один раз выбрать папку characters.",
		en: "Save the character to your vault folder? You'll need to pick the characters folder once."
	},

	"portrait.upload": { ru: "+ Портрет", en: "+ Portrait" },

	"label.xp": { ru: "ОЧКИ ОПЫТА", en: "EXPERIENCE POINTS" },
	"label.freebie": { ru: "СВОБОДНЫЕ ОЧКИ", en: "FREEBIE POINTS" },
	"label.name": { ru: "Имя", en: "Name" },
	"label.player": { ru: "Игрок", en: "Player" },
	"label.chronicle": { ru: "Хроника", en: "Chronicle" },
	"label.nature": { ru: "Натура", en: "Nature" },
	"label.demeanor": { ru: "Маска", en: "Demeanor" },
	"label.concept": { ru: "Амплуа", en: "Concept" },

	"concept.artist": { ru: "Артист", en: "Artist" },
	"concept.fighter": { ru: "Боец", en: "Fighter" },
	"concept.vagrant": { ru: "Бродяга", en: "Vagrant" },
	"concept.cleric": { ru: "Духовное лицо", en: "Cleric" },
	"concept.outcast": { ru: "Изгой", en: "Outcast" },
	"concept.intellectual": { ru: "Интеллектуал", en: "Intellectual" },
	"concept.politician": { ru: "Политик", en: "Politician" },
	"concept.criminal": { ru: "Преступник", en: "Criminal" },
	"concept.professional": { ru: "Профессионал", en: "Professional" },
	"concept.laborer": { ru: "Работяга", en: "Laborer" },
	"concept.child": { ru: "Ребёнок", en: "Child" },
	"concept.sleuth": { ru: "Сыщик", en: "Sleuth" },
	"label.clan": { ru: "Клан", en: "Clan" },
	"label.generation": { ru: "Поколение", en: "Generation" },
	"label.sire": { ru: "Сир", en: "Sire" },

	"heading.attributes": { ru: "Характеристики", en: "Attributes" },
	"category.physical": { ru: "Физические", en: "Physical" },
	"category.social": { ru: "Социальные", en: "Social" },
	"category.mental": { ru: "Ментальные", en: "Mental" },

	"heading.abilities": { ru: "Способности", en: "Abilities" },
	"category.talents": { ru: "Таланты", en: "Talents" },
	"category.skills": { ru: "Навыки", en: "Skills" },
	"category.knowledges": { ru: "Знания", en: "Knowledges" },
	"placeholder.newAbility": { ru: "Новая способность", en: "New ability" },

	"heading.advantages": { ru: "Преимущества", en: "Advantages" },
	"heading.disciplines": { ru: "Дисциплины", en: "Disciplines" },
	"action.addDiscipline": { ru: "+ Добавить дисциплину", en: "+ Add Discipline" },
	"heading.backgrounds": { ru: "Факты Биографии", en: "Backgrounds" },
	"action.addBackground": { ru: "+ Добавить факт биографии", en: "+ Add Background" },
	"heading.virtues": { ru: "Добродетели", en: "Virtues" },
	"virtue.conscience": { ru: "Совесть", en: "Conscience" },
	"virtue.conviction": { ru: "Решимость", en: "Conviction" },
	"virtue.selfControl": { ru: "Самоконтроль", en: "Self-Control" },
	"virtue.instinct": { ru: "Инстинкт", en: "Instinct" },
	"virtue.virtue3": { ru: "Смелость", en: "Courage" },

	"heading.bloodPool": { ru: "Запас крови", en: "Blood Pool" },
	"heading.road": { ru: "Дорога", en: "Road" },
	"heading.willpower": { ru: "Воля", en: "Willpower" },
	"heading.health": { ru: "Здоровье", en: "Health" },
	"health.bruised": { ru: "Помят", en: "Bruised" },
	"health.hurt": { ru: "Легко ранен", en: "Hurt" },
	"health.injured": { ru: "Ранен", en: "Injured" },
	"health.wounded": { ru: "Серьёзно ранен", en: "Wounded" },
	"health.mauled": { ru: "Тяжело ранен", en: "Mauled" },
	"health.crippled": { ru: "Едва жив", en: "Crippled" },
	"health.incapacitated": { ru: "При смерти", en: "Incapacitated" },


	"card.clanFlaw": { ru: "Клановый изъян", en: "Clan Flaw" },
	"placeholder.clanFlaw": { ru: "Изъян клана персонажа...", en: "The character's clan flaw..." },
	"card.nature": { ru: "Натура", en: "Nature" },
	"card.demeanor": { ru: "Маска", en: "Demeanor" },
	"card.sire": { ru: "Сир", en: "Sire" },
	"card.notes": { ru: "Заметки", en: "Notes" },
	"placeholder.notes": { ru: "Заметки о персонаже...", en: "Notes about the character..." },
	"notSelected": { ru: "Не выбрана", en: "Not selected" },
	"placeholder.sireNotes": { ru: "Что известно о сире персонажа...", en: "What's known about the character's sire..." },
	"cardSection.disciplines": { ru: "Дисциплины", en: "Disciplines" },
	"action.addDisciplineCard": { ru: "+ Добавить карточку дисциплины", en: "+ Add Discipline Card" },
	"cardSection.backgrounds": { ru: "Факты биографии", en: "Backgrounds" },

	"sins.heading": { ru: "Грехи", en: "Sins" },
	"sins.headingWithRoad": { ru: "Грехи: %s", en: "Sins: %s" },
	"sins.value": { ru: "Значение", en: "Rating" },
	"sins.sin": { ru: "Грех", en: "Sin" },
	"sins.rationale": { ru: "Обоснование", en: "Rationale" },

	"power.selectPlaceholder": { ru: "-- Выбрать силу --", en: "-- Select power --" },
	"power.createNew": { ru: "+ Создать новую силу", en: "+ Create new power" },
	"power.level": { ru: "Уровень", en: "Level" },
	"power.namePlaceholder": { ru: "Название силы", en: "Power name" },
	"power.descPlaceholder": { ru: "Описание силы...", en: "Power description..." },
	"power.rulesPlaceholder": { ru: "Правила силы...", en: "Power rules..." },
	"power.saveToLibrary": { ru: "Сохранить в библиотеку", en: "Save to library" },
	"power.rulesLabel": { ru: "Правила:", en: "Rules:" },
	"power.deleteTitle": { ru: "Удалить силу из библиотеки", en: "Remove power from library" },
	"power.enterName": { ru: "Введите название силы", en: "Enter a power name" },
	"power.confirmDelete": {
		ru: "Удалить силу \"%s\" из библиотеки? Она также пропадёт со всех карточек, где выбрана.",
		en: "Delete \"%s\" from the library? It will also disappear from every card where it's selected."
	},

	"ritualPath.checkboxLabel": { ru: "Имеет Ритуалы и Пути", en: "Has Rituals and Paths" },
	"ritualPath.noDisciplines": {
		ru: "Пока нет ни одной дисциплины, поддерживающей Ритуалы и Пути - добавьте её в разделе Дисциплины.",
		en: "No discipline supports Rituals and Paths yet - add one in the Disciplines section."
	},
	"cardSection.paths": { ru: "Пути", en: "Paths" },
	"cardSection.rituals": { ru: "Ритуалы", en: "Rituals" },
	"action.addPathCard": { ru: "+ Добавить карточку пути", en: "+ Add Path Card" },
	"action.addRitualCard": { ru: "+ Добавить карточку ритуала", en: "+ Add Ritual Card" },
	"library.paths": { ru: "Пути дисциплин", en: "Discipline Paths" },
	"library.rituals": { ru: "Ритуалы", en: "Rituals" },
	"library.disciplineLabel": { ru: "Дисциплина", en: "Discipline" },

	"path.selectPlaceholder": { ru: "-- Выбрать путь --", en: "-- Select path --" },
	"path.createNew": { ru: "+ Создать новый путь", en: "+ Create new path" },
	"path.level": { ru: "Уровень", en: "Level" },
	"path.namePlaceholder": { ru: "Название пути", en: "Path name" },
	"path.deleteTitle": { ru: "Удалить путь из библиотеки", en: "Remove path from library" },
	"path.enterName": { ru: "Введите название пути", en: "Enter a path name" },
	"path.confirmDelete": {
		ru: "Удалить путь \"%s\" из библиотеки? Он также пропадёт со всех карточек, где выбран.",
		en: "Delete \"%s\" from the library? It will also disappear from every card where it's selected."
	},

	"ritual.selectPlaceholder": { ru: "-- Выбрать ритуал --", en: "-- Select ritual --" },
	"ritual.createNew": { ru: "+ Создать новый ритуал", en: "+ Create new ritual" },
	"ritual.level": { ru: "Уровень", en: "Level" },
	"ritual.namePlaceholder": { ru: "Название ритуала", en: "Ritual name" },
	"ritual.descPlaceholder": { ru: "Описание ритуала...", en: "Ritual description..." },
	"ritual.rulesPlaceholder": { ru: "Правила ритуала...", en: "Ritual rules..." },
	"ritual.deleteTitle": { ru: "Удалить ритуал из библиотеки", en: "Remove ritual from library" },
	"ritual.enterName": { ru: "Введите название ритуала", en: "Enter a ritual name" },
	"ritual.confirmDelete": {
		ru: "Удалить ритуал \"%s\" из библиотеки? Он также пропадёт со всех карточек, где выбран.",
		en: "Delete \"%s\" from the library? It will also disappear from every card where it's selected."
	},

	"select.clan": { ru: "-- Выберите клан --", en: "-- Select clan --" },
	"select.nature": { ru: "-- Выберите натуру --", en: "-- Select nature --" },
	"select.demeanor": { ru: "-- Выберите маску --", en: "-- Select demeanor --" },

	"biography.addDots": { ru: "Добавьте точки, чтобы увидеть описание.", en: "Add dots to see the description." },
	"biography.unknownType": { ru: "Неизвестный тип", en: "Unknown type" },

	"alert.removeDotsFirst": { ru: "Сначала снимите все точки", en: "Remove all dots first" },
	"alert.notEnoughXp": { ru: "Недостаточно опыта", en: "Not enough experience" },
	"alert.notEnoughFreebie": { ru: "Недостаточно свободных очков", en: "Not enough freebie points" },
	"alert.noPointsAvailable": { ru: "Нет доступных очков", en: "No points available" },

	"blood.info": { ru: "Макс: %s | За ход: %s", en: "Max: %s | Per turn: %s" },

	"creation.attributes": { ru: "Атрибуты", en: "Attributes" },
	"creation.abilities": { ru: "Способности", en: "Abilities" },
	"creation.disciplines": { ru: "Дисциплины", en: "Disciplines" },
	"creation.backgrounds": { ru: "Биография", en: "Backgrounds" },
	"creation.virtues": { ru: "Добродетели", en: "Virtues" },
	"creation.current": { ru: "Текущее", en: "Current" },
	"creation.expected": { ru: "Ожидаемое", en: "Expected" }
}
