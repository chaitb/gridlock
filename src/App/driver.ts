import type { Driver } from "@/shared/model";

export type Constructor =
	| "Alpine"
	| "Aston Martin"
	| "Audi"
	| "Cadillac"
	| "Ferrari"
	| "Haas F1 Team"
	| "McLaren"
	| "Mercedes"
	| "Racing Bulls"
	| "Red Bull Racing"
	| "Williams";

export const DRIVERS = [
	{
		full_name: "Lando NORRIS",
		number: 1,
		acronym: "NOR",
		team_name: "McLaren",
		colour: "F47600",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png",
	},
	{
		full_name: "Max VERSTAPPEN",
		number: 3,
		acronym: "VER",
		team_name: "Red Bull Racing",
		colour: "4781D7",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png",
	},
	{
		full_name: "Gabriel BORTOLETO",
		number: 5,
		acronym: "BOR",
		team_name: "Audi",
		colour: "F50537",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png.transform/1col/image.png",
	},
	{
		full_name: "Isack HADJAR",
		number: 6,
		acronym: "HAD",
		team_name: "Red Bull Racing",
		colour: "4781D7",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png.transform/1col/image.png",
	},
	{
		full_name: "Pierre GASLY",
		number: 10,
		acronym: "GAS",
		team_name: "Alpine",
		colour: "00A1E8",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/1col/image.png",
	},
	{
		full_name: "Sergio PEREZ",
		number: 11,
		acronym: "PER",
		team_name: "Cadillac",
		colour: "909090",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/1col/image.png",
	},
	{
		full_name: "Kimi ANTONELLI",
		number: 12,
		acronym: "ANT",
		team_name: "Mercedes",
		colour: "00D7B6",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/ANDANT01_Kimi_Antonelli/andant01.png.transform/1col/image.png",
	},
	{
		full_name: "Fernando ALONSO",
		number: 14,
		acronym: "ALO",
		team_name: "Aston Martin",
		colour: "229971",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png",
	},
	{
		full_name: "Charles LECLERC",
		number: 16,
		acronym: "LEC",
		team_name: "Ferrari",
		colour: "ED1131",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png",
	},
	{
		full_name: "Lance STROLL",
		number: 18,
		acronym: "STR",
		team_name: "Aston Martin",
		colour: "229971",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/1col/image.png",
	},
	{
		full_name: "Alexander ALBON",
		number: 23,
		acronym: "ALB",
		team_name: "Williams",
		colour: "1868DB",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/1col/image.png",
	},
	{
		full_name: "Nico HULKENBERG",
		number: 27,
		acronym: "HUL",
		team_name: "Audi",
		colour: "F50537",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/1col/image.png",
	},
	{
		full_name: "Liam LAWSON",
		number: 30,
		acronym: "LAW",
		team_name: "Racing Bulls",
		colour: "6C98FF",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/1col/image.png",
	},
	{
		full_name: "Esteban OCON",
		number: 31,
		acronym: "OCO",
		team_name: "Haas F1 Team",
		colour: "9C9FA2",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/1col/image.png",
	},
	{
		full_name: "Arvid LINDBLAD",
		number: 41,
		acronym: "LIN",
		team_name: "Racing Bulls",
		colour: "6C98FF",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ARVLIN01_Arvid_Lindblad/arvlin01.png.transform/1col/image.png",
	},
	{
		full_name: "Franco COLAPINTO",
		number: 43,
		acronym: "COL",
		team_name: "Alpine",
		colour: "00A1E8",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png.transform/1col/image.png",
	},
	{
		full_name: "Lewis HAMILTON",
		number: 44,
		acronym: "HAM",
		team_name: "Ferrari",
		colour: "ED1131",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png",
	},
	{
		full_name: "Carlos SAINZ",
		number: 55,
		acronym: "SAI",
		team_name: "Williams",
		colour: "1868DB",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png",
	},
	{
		full_name: "George RUSSELL",
		number: 63,
		acronym: "RUS",
		team_name: "Mercedes",
		colour: "00D7B6",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png",
	},
	{
		full_name: "Valtteri BOTTAS",
		number: 77,
		acronym: "BOT",
		team_name: "Cadillac",
		colour: "909090",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/1col/image.png",
	},
	{
		full_name: "Oscar PIASTRI",
		number: 81,
		acronym: "PIA",
		team_name: "McLaren",
		colour: "F47600",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png",
	},
	{
		full_name: "Oliver BEARMAN",
		number: 87,
		acronym: "BEA",
		team_name: "Haas F1 Team",
		colour: "9C9FA2",
		headshot_url:
			"https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/1col/image.png",
	},
] as Driver[];
