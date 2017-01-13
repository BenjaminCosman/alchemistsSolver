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

var potions = [
  [+1, 0, 0], [-1, 0, 0], [0, +1, 0], [0, -1, 0], [0, 0, +1], [0, 0, -1], [0, 0, 0]
]
var potionsInverted = _.invert(_.values(potions))

// These must match the potion and aspect filenames in /images
var fileNames = [
  "Red+", "Red-", "Green+", "Green-", "Blue+", "Blue-", "Soup"
]

var colors = ["Red", "Green", "Blue"]

export {alchemicals, ingredients, potions, potionsInverted, fileNames, colors}
