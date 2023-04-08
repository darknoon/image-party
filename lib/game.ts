type UserId = string

export const exampleGameRound: GameRound = {
  id: "1",
  choices: [
    {
      id: "1",
      title: "Character",
      choices: [
        "Harry Potter",
        "Hermione Granger",
        "Ron Weasley",
        "Albus Dumbledore",
        "Severus Snape",
      ].map((text) => ({ text })),
    },
    {
      id: "2",
      title: "Location",
      choices: [
        "Hogwarts",
        "Diagon Alley",
        "Hogsmeade",
        "The Ministry of Magic",
        "Godric's Hollow",
      ].map((text) => ({ text })),
    },
    {
      id: "3",
      title: "Object",
      choices: [
        "The Elder Wand",
        "The Resurrection Stone",
        "The Cloak of Invisibility",
        "The Invisibility Cloak",
        "The Philosopher's Stone",
      ].map((text) => ({ text })),
    },
  ],
  userChoices: {},
  phase: "PickingElements",
}

export type GameRound = {
  id: string
  choices: ChoiceGroup[]
  userChoices: Record<UserId, Record<string, number>>
  phase: GamePhase
}

export type GamePhase =
  | "WaitingForPlayers"
  | "PickingElements"
  | "GeneratingImage"
  | "PickingImage"
  | "Voting"
  | "Results"

export type ChoiceGroup = {
  id: string
  title: string
  choices: Choice[]
}

export type Choice = {
  text: string
}
