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

var aspects = {
  "Red+":   [+1, 0, 0],
  "Red-":   [-1, 0, 0],
  "Green+": [0, +1, 0],
  "Green-": [0, -1, 0],
  "Blue+":  [0, 0, +1],
  "Blue-":  [0, 0, -1],
}

// Potions also have a 7th: Soup
var potions = _.clone(aspects)
potions["Soup"] = [0, 0, 0]

export {alchemicals, ingredients, aspects, potions}
