import _ from 'lodash'


// Here are all of the Alchemicals:
const alchemicals = [
  [-1, +1, -1],
  [+1, -1, +1],
  [+1, -1, -1],
  [-1, +1, +1],
  [-1, -1, +1],
  [+1, +1, -1],
  [-1, -1, -1],
  [+1, +1, +1],
]

const ingredients = [
  "Mushroom",
  "Fern",
  "Toad",
  "Birdclaw",
  "Flower",
  "Mandrake",
  "Scorpion",
  "Feather",
]

const correctnessOpts = {
  "Correct": [true, true, true],
  "Off by Red": [false, true, true],
  "Off by Green": [true, false, true],
  "Off by Blue": [true, true, false],
  "Only correct in Red": [true, false, false],
  "Only correct in Green": [false, true, false],
  "Only correct in Blue": [false, false, true],
  "Utterly wrong": [false, false, false],
}

// These must match the potion and aspect filenames in /images
const potions = {
  "Red+":   [+1, 0, 0],
  "Red-":   [-1, 0, 0],
  "Green+": [0, +1, 0],
  "Green-": [0, -1, 0],
  "Blue+":  [0, 0, +1],
  "Blue-":  [0, 0, -1],
  "Soup":   [0, 0, 0]
}
const potionsInverted = _.invert(_.values(potions))

export {alchemicals, ingredients, potions, potionsInverted, correctnessOpts}
