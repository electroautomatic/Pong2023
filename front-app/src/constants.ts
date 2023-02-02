export const SERVER_URL = "http://localhost:3001/"
// export const SERVER_URL = "http://10.12.11.53:3001/"
export const GET_AVATAR_URL = SERVER_URL+"avatar/"

export const colors = {
	BG_COLOR_DEFAULT 	: "#202020",
	BG_COLOR_222     	: "#222",
	BG_COLOR_24      	: "#242424",
	BG_COLOR_26			: "#262626",
	BG_COLOR_28			: "#282828",
	BG_COLOR_30			: "#303030",
	BG_COLOR_333		: "#333",
	BG_COLOR_444		: "#444",
	LIGHT_RED			: "#d76",
	RED					: "#c53",
	LIGHT_GREEN			: "#7ba",
	BLUE				: "#056",
	GREEN				: "#4a8",
	TEXT_COLOR_DEFAULT	: "#ccc",
	TEXT_COLOR_MINUS_1	: "#bbb",
	TEXT_COLOR_MINUS_2	: "#aaa",
	TEXT_COLOR_666	: "#666",
}

export const AchievementsResource = [
	{
		name : "How did you get it??",
		desc : "Get an achievement which is not exist",
		color : "#949",
		text: "😱"
	},
	{
		name : "You are here",
		desc : "Your first entry to ft_transcendence",
		color : "#fc6",
		text: "🐣"

	},
	{
		name : "You did it!",
		desc : "You won your first game",
		color : "#a77",
		text: "🥇"
	},
	{
		name : "Grandmaster!",
		desc : "You won 10 times",
		color : "#a66",
		text: "🔥"
	},
	{
		name : "Mate",
		desc : "You add your first friend",
		color : colors.LIGHT_GREEN,
		text: "🐝"
	},
	{
		name : "Man of the world",
		desc : "You add 5 friends",
		color : colors.BLUE,
		text: "🐳"
	},
	{
		name : "I hate people",
		desc : "You add 3 people in blacklist",
		color : "#555",
		text: "🦧"
	}
]