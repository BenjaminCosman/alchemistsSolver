import _ from 'lodash'


// Here are all of the Alchemicals:
var alchemicals = [
  [-1, +1, -1],
  [+1, -1, +1],
  [+1, -1, -1],
  [-1, +1, +1],
  [-1, -1, +1],
  [+1, +1, -1],
  [-1, -1, -1],
  [+1, +1, +1],
]

var ingredients = [
  "Mushroom",
  "Fern",
  "Toad",
  "Birdclaw",
  "Flower",
  "Mandrake",
  "Scorpion",
  "Feather",
]

let correctnessOpts = {
  "Correct": [true, true, true],
  "Off by Red": [false, true, true],
  "Off by Green": [true, false, true],
  "Off by Blue": [true, true, false],
  "Only correct in Red": [true, false, false],
  "Only correct in Green": [false, true, false],
  "Only correct in Blue": [false, false, true],
  "Utterly wrong": [false, false, false],
}

var potions = [
  [+1, 0, 0], [-1, 0, 0], [0, +1, 0], [0, -1, 0], [0, 0, +1], [0, 0, -1], [0, 0, 0]
]
var potionsInverted = _.invert(_.values(potions))

// These must match the potion and aspect filenames in /images
var fileNames = [
  "Red+", "Red-", "Green+", "Green-", "Blue+", "Blue-", "Soup"
]

export {alchemicals, ingredients, potions, potionsInverted, fileNames, correctnessOpts}
