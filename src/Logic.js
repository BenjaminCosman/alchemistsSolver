import math from 'mathjs'
import _ from 'lodash'

import {alchemicals} from './Enums.js'
import {worldWeight} from './App.js'

// WeightedWorld -> (Ingredient, Ingredient) -> Potion
function mixInWorld(weightedWorld, ingredients) {
  const alchemicalA = alchemicals[weightedWorld.ingAlcMap[ingredients[0]]]
  const alchemicalB = alchemicals[weightedWorld.ingAlcMap[ingredients[1]]]
  return mix(alchemicalA, alchemicalB)
}

// Alchemical -> Alchemical -> Potion
function mix(alchemicalA, alchemicalB) {
  if (alchemicalA[0] === alchemicalB[0] && alchemicalA[1] !== alchemicalB[1]) {
    return [alchemicalA[0], 0, 0]
  }
  if (alchemicalA[1] === alchemicalB[1] && alchemicalA[2] !== alchemicalB[2]) {
    return [0, alchemicalA[1], 0]
  }
  if (alchemicalA[2] === alchemicalB[2] && alchemicalA[0] !== alchemicalB[0]) {
    return [0, 0, alchemicalA[2]]
  }
  return [0, 0, 0]
}

// [WeightedWorld] -> [[Percentage]]
function coreTableInfo(worlds) {
  let result = [
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
  ]

  _.forEach(worlds, (world) => {
    _.forEach(world.ingAlcMap, (alchemical, ingredient) => {
      result[alchemical][ingredient] += worldWeight(world)
    })
  })

  const denominator = _.sum(result[0])

  return math.dotMultiply(result, 1/denominator)
}

// [[Percentage]] -> ([Ingredient], [Ingredient])
function coreTheories(data) {
  let certainIngredients = []
  let hedgeIngredients = {}
  for (let col = 0; col < 8; col++) {
    let options = []
    for (let row = 0; row < 8; row++) {
      if (data[row][col] > 0) {
        options.push(alchemicals[row])
      }
    }
    if (options.length === 1) {
      certainIngredients.push(col)
    } else if (options.length === 2) {
      const differingAspects = _.zipWith(options[0], options[1], (a, b) => a === b ? 0 : 1)
      if (_.sum(differingAspects) === 1) {
        hedgeIngredients[col] = differingAspects.indexOf(1)
      }
    }
  }
  return [certainIngredients, hedgeIngredients]
}

export {mixInWorld, coreTableInfo, coreTheories}
