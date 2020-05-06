import {dotMultiply} from 'mathjs'
import _ from 'lodash'

import {alchemicals, certainty} from './Enums.js'

// Type Proportion = {v:float | 0 <= v <= 1}

// WeightedWorld -> int
function worldWeight(world) {
  return world.multiplicity * world.golemMaps.length
}

function partitionWeight(worlds) {
  return _.sumBy(worlds, worldWeight)
}

// WeightedWorld -> (Ingredient, Ingredient) -> Potion
function mixInWorld(weightedWorld, ingredients) {
  const alchemicalA = alchemicals[weightedWorld.ingAlcMap[ingredients[0]]]
  const alchemicalB = alchemicals[weightedWorld.ingAlcMap[ingredients[1]]]
  return mix(alchemicalA, alchemicalB)
}

// Alchemical -> Alchemical -> Potion
function mix([rA, gA, bA], [rB, gB, bB]) {
  if (rA === rB && gA !== gB) {
    return [rA, 0, 0]
  }
  if (gA === gB && bA !== bB) {
    return [0, gA, 0]
  }
  if (bA === bB && rA !== rB) {
    return [0, 0, bA]
  }
  return [0, 0, 0]
}

// [WeightedWorld] -> [[Proportion]]
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
  let denominator = 0

  _.forEach(worlds, (world) => {
    let weight = worldWeight(world)
    denominator += weight
    _.forEach(world.ingAlcMap, (alchemical, ingredient) => {
      result[alchemical][ingredient] += weight
    })
  })

  return dotMultiply(result, 1/denominator)
}

// [WeightedWorld] -> [[Proportion]]
function encyclopediaTableInfo(worlds) {
  let result = [
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
  ]
  let denominator = 0

  _.forEach(worlds, (world) => {
    let weight = worldWeight(world)
    denominator += weight
    _.forEach(world.ingAlcMap, (alchemical, ingredient) => {
      _.forEach(alchemicals[alchemical], (sign, aspectIndex) => {
        if (sign === +1) {
          result[aspectIndex][ingredient] += weight
        }
      })
    })
  })

  return dotMultiply(result, 1/denominator)
}

// [WeightedWorld] -> [[Proportion]]
function golemTableInfo(worlds) {
  let result = [
    [0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0,],
  ]
  let denominator = 0

  _.forEach(worlds, (world) => {
    denominator += worldWeight(world)
    _.forEach(world.golemMaps, (golemMap) => {
      _.forEach(golemMap, (effect, index) => {
        if (effect !== 'nothing') {
          let row = effect.affects === 'ears' ? 0 : 1
          let col = 2*index + (effect.size === 1 ? 0 : 1)
          result[row][col] += world.multiplicity
        }
      })
    })
  })

  return dotMultiply(result, 1/denominator)
}

// [[Proportion]] -> ([Ingredient], {Ingredient:Aspect})
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
      const differingAspects =
        _.zipWith(options[0], options[1], (a, b) => a === b ? 0 : 1)
      if (_.sum(differingAspects) === 1) {
        hedgeIngredients[col] = differingAspects.indexOf(1)
      }
    }
  }
  return [certainIngredients, hedgeIngredients]
}

// [[Proportion]] -> (int, int)
function encyclopediaTheories(worlds) {
  let certain = 0
  let hedge = 0
  _.forEach(encyclopediaTableInfo(worlds), (row) => {
    const result = encyclopediaClassify(row)
    if (result === certainty.CERTAIN) {
      certain++
    } else if (result === certainty.HEDGE) {
      hedge++
    }
  })
  return [certain, hedge]
}

function encyclopediaClassify(row) {
  const pluses = _.filter(row, v => v === 1).length
  const minuses = _.filter(row, v => v === 0).length
  if (pluses >= 2 && minuses >= 2) { // if you know 4-0, you actually know 4-4
    return certainty.CERTAIN
  } else if (pluses + minuses >= 3) {
    return certainty.HEDGE
  }
  return certainty.NONE
}

function golemClassify(row) {
  let remaining = _.size(_.filter(row, v => v > 0))
  if (remaining === 1) {
    return certainty.CERTAIN
  } else if (remaining === 2) {
    return certainty.HEDGE
  }
  return certainty.NONE
}

function flipBit(oldBitSet, index) {
  let newBitSet = _.slice(oldBitSet)
  newBitSet[index] = !oldBitSet[index]
  return newBitSet
}

export {mixInWorld,
  coreTableInfo, coreTheories,
  encyclopediaTableInfo, encyclopediaClassify, encyclopediaTheories,
  golemTableInfo, golemClassify,
  worldWeight, partitionWeight,
  flipBit}
