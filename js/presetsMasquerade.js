import { darkAgesDefaults } from "./VDA20data.js"

export const clans = {
	assamite: { name: { ru: "Ассамиты", en: "Assamite" }, disciplines: ["celerity", "obfuscate", "quietus"] },
	brujah: { name: { ru: "Бруха", en: "Brujah" }, disciplines: ["celerity", "potence", "presence"] },
	followersOfSet: { name: { ru: "Последователи Сета", en: "Followers of Set" }, disciplines: ["obfuscate", "presence", "serpentis"] },
	gangrel: { name: { ru: "Гангрел", en: "Gangrel" }, disciplines: ["animalism", "fortitude", "protean"] },
	giovanni: { name: { ru: "Джованни", en: "Giovanni" }, disciplines: ["domination", "necromancy", "potence"] },
	lasombra: { name: { ru: "Ласомбра", en: "Lasombra" }, disciplines: ["domination", "obtenebration", "potence"] },
	malkavian: { name: { ru: "Малкавиан", en: "Malkavian" }, disciplines: ["auspex", "dementation", "obfuscate"] },
	nosferatu: { name: { ru: "Носферату", en: "Nosferatu" }, disciplines: ["animalism", "obfuscate", "potence"] },
	ravnos: { name: { ru: "Равнос", en: "Ravnos" }, disciplines: ["animalism", "chimerstry", "fortitude"] },
	toreador: { name: { ru: "Тореадор", en: "Toreador" }, disciplines: ["auspex", "celerity", "presence"] },
	tremere: { name: { ru: "Тремер", en: "Tremere" }, disciplines: ["auspex", "domination", "thaumaturgy"] },
	tzimisce: { name: { ru: "Цимисхи", en: "Tzimisce" }, disciplines: ["animalism", "auspex", "vicissitude"] },
	ventrue: { name: { ru: "Вентру", en: "Ventrue" }, disciplines: ["domination", "fortitude", "presence"] },

	caitiff: { name: { ru: "Каитифы", en: "Caitiff" }, disciplines: [] }
}

export const disciplineTypes = {
	animalism: { name: { ru: "Анимализм", en: "Animalism" } },
	auspex: { name: { ru: "Ясновидение", en: "Auspex" } },
	celerity: { name: { ru: "Стремительность", en: "Celerity" } },
	chimerstry: { name: { ru: "Фантасмагория", en: "Phantasmagoria" } },
	dementation: { name: { ru: "Помешательство", en: "Dementation" } },
	domination: { name: { ru: "Доминирование", en: "Dominate" } },
	fortitude: { name: { ru: "Стойкость", en: "Fortitude" } },
	necromancy: { name: { ru: "Некромантия", en: "Necromancy" }, ritualPaths: true },
	obfuscate: { name: { ru: "Сокрытие", en: "Obfuscate" } },
	obtenebration: { name: { ru: "Затмение", en: "Obtenebration" } },
	potence: { name: { ru: "Мощь", en: "Potence" } },
	presence: { name: { ru: "Величие", en: "Presence" } },
	protean: { name: { ru: "Метаморфозы", en: "Protean" } },
	quietus: { name: { ru: "Упокоение", en: "Quietus" } },
	serpentis: { name: { ru: "Серпентис", en: "Serpentis" }, ritualPaths: true },
	thaumaturgy: { name: { ru: "Тауматургия", en: "Thaumaturgy" }, ritualPaths: true },
	vicissitude: { name: { ru: "Преображение", en: "Vicissitude" } }
}

export const abilityTypes = {
	alertness: { name: { ru: "Бдительность", en: "Alertness" }, category: "talents" },
	athletics: { name: { ru: "Атлетика", en: "Athletics" }, category: "talents" },
	awareness: { name: { ru: "Шестое чувство", en: "Awareness" }, category: "talents" },
	brawl: { name: { ru: "Драка", en: "Brawl" }, category: "talents" },
	empathy: { name: { ru: "Эмпатия", en: "Empathy" }, category: "talents" },
	expression: { name: { ru: "Красноречие", en: "Expression" }, category: "talents" },
	intimidation: { name: { ru: "Запугивание", en: "Intimidation" }, category: "talents" },
	leadership: { name: { ru: "Лидерство", en: "Leadership" }, category: "talents" },
	streetwise: { name: { ru: "Уличное чутьё", en: "Streetwise" }, category: "talents" },
	subterfuge: { name: { ru: "Хитрость", en: "Subterfuge" }, category: "talents" },

	animalKen: { name: { ru: "Обращение с животными", en: "Animal Ken" }, category: "skills" },
	crafts: { name: { ru: "Ремесло", en: "Crafts" }, category: "skills" },
	drive: { name: { ru: "Вождение", en: "Drive" }, category: "skills" },
	etiquette: { name: { ru: "Этикет", en: "Etiquette" }, category: "skills" },
	firearms: { name: { ru: "Стрельба", en: "Firearms" }, category: "skills" },
	larceny: { name: { ru: "Воровство", en: "Larceny" }, category: "skills" },
	melee: { name: { ru: "Фехтование", en: "Melee" }, category: "skills" },
	performance: { name: { ru: "Исполнение", en: "Performance" }, category: "skills" },
	stealth: { name: { ru: "Скрытность", en: "Stealth" }, category: "skills" },
	survival: { name: { ru: "Выживание", en: "Survival" }, category: "skills" },

	academics: { name: { ru: "Гуманитарные науки", en: "Academics" }, category: "knowledges" },
	computer: { name: { ru: "Информатика", en: "Computer" }, category: "knowledges" },
	electronics: { name: { ru: "Электроника", en: "Electronics" }, category: "knowledges" },
	finance: { name: { ru: "Финансы", en: "Finance" }, category: "knowledges" },
	investigation: { name: { ru: "Расследование", en: "Investigation" }, category: "knowledges" },
	law: { name: { ru: "Законы", en: "Law" }, category: "knowledges" },
	medicine: { name: { ru: "Медицина", en: "Medicine" }, category: "knowledges" },
	occult: { name: { ru: "Оккультизм", en: "Occult" }, category: "knowledges" },
	politics: { name: { ru: "Политика", en: "Politics" }, category: "knowledges" },
	science: { name: { ru: "Естественные науки", en: "Science" }, category: "knowledges" }
}

export const archetypes = {
	autocrat: { name: { ru: "Автократ", en: "Autocrat" }, description: { ru: "Стремится к полному контролю и власти над окружающими.", en: "Seeks total control and authority over those around him." } },
	bonVivant: { name: { ru: "Бонвиван", en: "Bon Vivant" }, description: { ru: "Живёт ради удовольствий момента и разделяет их с другими.", en: "Lives for the pleasures of the moment and shares them with others." } },
	fighter: { name: { ru: "Борец", en: "Fighter" }, description: { ru: "Не останавливается ни перед чем и всегда доводит борьбу до конца.", en: "Never backs down and always sees a fight through to the end." } },
	curmudgeon: { name: { ru: "Брюзга", en: "Curmudgeon" }, description: { ru: "Скрывает доброту за резкостью, цинизмом и вечным недовольством.", en: "Hides kindness behind gruffness, cynicism, and constant griping." } },
	rebel: { name: { ru: "Бунтарь", en: "Rebel" }, description: { ru: "Противостоит авторитету, правилам и устоявшимся порядкам.", en: "Pushes back against authority, rules, and the established order." } },
	visionary: { name: { ru: "Визионер", en: "Visionary" }, description: { ru: "Ведом великой идеей, мечтой или видением будущего.", en: "Driven by a great idea, dream, or vision of the future." } },
	thug: { name: { ru: "Головорез", en: "Thug" }, description: { ru: "Добивается своего силой, угрозами и грубым давлением.", en: "Gets his way through brute force, threats, and intimidation." } },
	guru: { name: { ru: "Гуру", en: "Guru" }, description: { ru: "Своей мудростью и спокойствием вдохновляет окружающих на духовные искания.", en: "Inspires others toward spiritual or ideological pursuits through his wisdom and calm." } },
	deviant: { name: { ru: "Девиант", en: "Deviant" }, description: { ru: "Намеренно нарушает нормы и ожидания общества.", en: "Deliberately breaks society's norms and expectations." } },
	enigma: { name: { ru: "Загадка", en: "Enigma" }, description: { ru: "Действует по собственной логике, непонятной окружающим.", en: "Acts on private reasoning that others can never quite follow." } },
	idealist: { name: { ru: "Идеалист", en: "Idealist" }, description: { ru: "Верит, что совершенство существует, и неустанно к нему стремится.", en: "Believes that perfection exists and relentlessly strives toward it." } },
	explorer: { name: { ru: "Исследователь", en: "Explorer" }, description: { ru: "Видит в окружающем мире неразгаданную тайну и стремится познать её.", en: "Sees the world as an unsolved mystery and is driven to understand it." } },
	capitalist: { name: { ru: "Капиталист", en: "Capitalist" }, description: { ru: "Считает, что любую вещь и любого человека можно превратить в выгоду.", en: "Believes anything, and anyone, can be turned into profit." } },
	penitent: { name: { ru: "Кающийся грешник", en: "Penitent" }, description: { ru: "Ищет искупления за реальные или воображаемые грехи прошлого.", en: "Seeks atonement for real or imagined sins of the past." } },
	conformist: { name: { ru: "Конформист", en: "Conformist" }, description: { ru: "Подстраивается под ожидания группы, избегает выделяться.", en: "Falls in line with the group's expectations and avoids standing out." } },
	masochist: { name: { ru: "Мазохист", en: "Masochist" }, description: { ru: "Находит смысл и облегчение через страдание.", en: "Finds meaning and relief through suffering." } },
	conniver: { name: { ru: "Махинатор", en: "Conniver" }, description: { ru: "Манипулирует людьми и обстоятельствами ради собственной выгоды.", en: "Manipulates people and circumstances for personal gain." } },
	martyr: { name: { ru: "Мученик", en: "Martyr" }, description: { ru: "Жертвует собой и своими интересами ради других.", en: "Sacrifices himself and his own interests for the sake of others." } },
	narcissist: { name: { ru: "Нарцисс", en: "Narcissist" }, description: { ru: "Считает себя центром мироздания и требует восхищения от окружающих.", en: "Sees himself as the center of the world and demands the admiration of others." } },
	pedagogue: { name: { ru: "Наставник", en: "Pedagogue" }, description: { ru: "Учит, направляет и передаёт свои знания другим.", en: "Teaches, guides, and passes his knowledge on to others." } },
	gadfly: { name: { ru: "Непоседа", en: "Gadfly" }, description: { ru: "Не даёт покоя власть имущим, вечно указывая на их промахи.", en: "Gives those in power no peace, endlessly pointing out their mistakes." } },
	loner: { name: { ru: "Одиночка", en: "Loner" }, description: { ru: "Предпочитает действовать в одиночку, не доверяя другим важные дела.", en: "Prefers working alone, unwilling to trust others with what matters." } },
	eyeOfTheStorm: { name: { ru: "Око бури", en: "Eye of the Storm" }, description: { ru: "Остаётся невозмутимым в самом центре хаоса и потрясений.", en: "Remains unshaken at the very center of chaos and upheaval." } },
	caregiver: { name: { ru: "Опекун", en: "Caregiver" }, description: { ru: "Заботится о благополучии и безопасности других.", en: "Looks after the well-being and safety of others." } },
	director: { name: { ru: "Организатор", en: "Director" }, description: { ru: "Следит, чтобы всё шло по плану, и не выносит хаоса и небрежности.", en: "Makes sure everything goes according to plan and has no patience for chaos or carelessness." } },
	perfectionist: { name: { ru: "Перфекционист", en: "Perfectionist" }, description: { ru: "Требует безупречности от себя и окружающих.", en: "Demands flawlessness from himself and everyone around him." } },
	victor: { name: { ru: "Победитель", en: "Victor" }, description: { ru: "Превращает любую ситуацию в состязание и должен непременно победить.", en: "Turns every situation into a contest and simply has to win." } },
	devotee: { name: { ru: "Подвижник", en: "Devotee" }, description: { ru: "Черпает силы в беззаветном служении своему делу или вере.", en: "Draws his strength from utter devotion to his cause or faith." } },
	child: { name: { ru: "Ребёнок", en: "Child" }, description: { ru: "Полагается на защиту и снисхождение окружающих, наивен.", en: "Relies on others' protection and indulgence, and stays naive." } },
	sadist: { name: { ru: "Садист", en: "Sadist" }, description: { ru: "Получает удовольствие, причиняя боль другим.", en: "Takes pleasure in inflicting pain on others." } },
	soldier: { name: { ru: "Солдат", en: "Soldier" }, description: { ru: "Живёт по чёткому кодексу и требует, чтобы приказы ему не противоречили.", en: "Lives by a strict code and expects orders never to contradict it." } },
	daredevil: { name: { ru: "Сорвиголова", en: "Daredevil" }, description: { ru: "Жаждет риска и острых ощущений почти так же сильно, как и крови.", en: "Craves risk and thrills almost as hungrily as he craves blood." } },
	sociopath: { name: { ru: "Социопат", en: "Sociopath" }, description: { ru: "Считает окружающих существами низшего порядка, не заслуживающими пощады.", en: "Regards others as lesser beings undeserving of mercy." } },
	judge: { name: { ru: "Судья", en: "Judge" }, description: { ru: "Ищет истину и выносит взвешенные, справедливые решения.", en: "Seeks the truth and hands down measured, fair judgments." } },
	creator: { name: { ru: "Творец", en: "Creator" }, description: { ru: "Стремится создать что-то важное и долговечное своими руками.", en: "Strives to create something important and lasting with his own hands." } },
	traditionalist: { name: { ru: "Традиционалист", en: "Traditionalist" }, description: { ru: "Чтит устои, обычаи и порядок, установленный предками.", en: "Honors the customs, traditions, and order laid down by his forebears." } },
	trickster: { name: { ru: "Трикстер", en: "Trickster" }, description: { ru: "Смехом и обманом сглаживает боль и обнажает нелепость мира.", en: "Uses laughter and deception to soften pain and expose the absurdity of the world." } },
	fanatic: { name: { ru: "Фанатик", en: "Fanatic" }, description: { ru: "Полностью предан делу, идее или организации.", en: "Utterly devoted to a cause, idea, or organization." } },
	freak: { name: { ru: "Фрик", en: "Freak" }, description: { ru: "Тревожит окружающих своим поведением, в котором порой проскальзывают странные озарения.", en: "Unsettles others with behavior that occasionally flashes with strange insight." } },
	chameleon: { name: { ru: "Хамелеон", en: "Chameleon" }, description: { ru: "Легко подстраивается под любое окружение, оставаясь незаметным.", en: "Easily adapts to any surroundings, staying unnoticed." } },
	monster: { name: { ru: "Чудовище", en: "Monster" }, description: { ru: "Принимает свою тёмную природу и не скрывает её.", en: "Embraces his dark nature and makes no effort to hide it." } },
	egotist: { name: { ru: "Эгоцентрист", en: "Egotist" }, description: { ru: "Заботится исключительно о собственных интересах и удобстве.", en: "Cares only about his own interests and comfort." } }
}

const sabbatBackgroundTypes = {
	sabbatRites: {
		name: { ru: "Обряды (Шабаш)", en: "Rites (Sabbat)" },
		levels: [
			{ ru: "Знает и способен провести один из простых обрядов Шабаша.", en: "Knows and can conduct one of the Sabbat's simpler rites." },
			{ ru: "Знает несколько распространённых обрядов и проводит их уверенно.", en: "Knows several common rites and performs them with confidence." },
			{ ru: "Освоил ряд серьёзных обрядов, в том числе применяемых при посвящении.", en: "Has mastered a number of serious rites, including some used in initiation." },
			{ ru: "Известен как умелый проводник даже редких и сложных обрядов.", en: "Known as a skilled conductor of even rare and demanding rites." },
			{ ru: "Один из немногих, кто способен провести любой обряд Шабаша, включая самые тайные.", en: "One of the few capable of conducting any Sabbat rite, including its most secret ones." }
		]
	},
	blackHandMembership: {
		name: { ru: "Членство в Чёрной Руке", en: "Black Hand Membership" },
		levels: [
			{ ru: "Принят в Чёрную Руку на самом низшем положении, едва признан своим.", en: "Accepted into the Black Hand at its lowest standing, barely recognized as one of their own." },
			{ ru: "Заслужил доверие немногочисленной ячейки Чёрной Руки.", en: "Has earned the trust of a small Black Hand cell." },
			{ ru: "Признанный оперативник, которому доверяют серьёзные задания.", en: "A recognized operative entrusted with serious assignments." },
			{ ru: "Пользуется большим влиянием внутри организации.", en: "Wields considerable influence within the organization." },
			{ ru: "Один из руководителей Чёрной Руки, чьё слово имеет вес во всём Шабаше.", en: "One of the Black Hand's leaders, whose word carries weight across the entire Sabbat." }
		]
	}
}

export const masqueradeDefaults = {
	attributeTypes: structuredClone(darkAgesDefaults.attributeTypes),
	abilityTypes: structuredClone(abilityTypes),
	clans: structuredClone(clans),
	disciplineTypes: structuredClone(disciplineTypes),
	archetypes: structuredClone(archetypes),
	backgroundTypes: { ...structuredClone(darkAgesDefaults.backgroundTypes), ...structuredClone(sabbatBackgroundTypes) },
	roadTypes: structuredClone(darkAgesDefaults.roadTypes),
	powerLibrary: {},
	ritualLibrary: {},
	pathLibrary: {}
}
