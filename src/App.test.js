import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {TwoIngredientFact} from './Facts'

//TODO: rewrite this obsolete test now that worlds have become more complicated
// objects and we use updatePrior instead of check

var assert = require('assert')

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<App />, div)
})

it('checks one example fact', () => {
  // Here is what a World looks like:
  var exampleWorld = [
    [+1, -1, -1],
    [-1, +1, -1],
    [+1, -1, +1],
    [-1, +1, +1],
    [+1, +1, +1],
    [-1, -1, +1],
    [+1, +1, -1],
    [-1, -1, -1],
  ]

  // This is what an Ingredient looks like:
  var exampleIngredientA = 4
  var exampleIngredientB = 5

  // This is what a Potion looks like:
  var examplePotionA = [0, 0, 1] // this is a blue+
  var examplePotionB = [0, 0, 0] // this is soup

  // This is what a Fact looks like:
  // {
  //   ingredients: [5, 7]
  //   possibleResults: [true, false, false, false, false, false, true]
  // }
  // combining ingredient 5 and 7 make either a red+ or a soup
  var exampleFact = new TwoIngredientFact(
    [exampleIngredientA, exampleIngredientB],
    [examplePotionA, examplePotionB]
  )

  assert(exampleFact.check(exampleWorld))
})
