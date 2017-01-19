import _ from 'lodash'
import {alchemicals} from './Enums.js'

// http://stackoverflow.com/a/20871714/6036628
function permutator(inputArr) {
  let results = []

  function permute(arr, memo) {
    let cur = memo

    for (let i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1)
      if (arr.length === 0) {
        results.push(memo.concat(cur))
      }
      permute(arr.slice(), memo.concat(cur))
      arr.splice(i, 0, cur[0])
    }

    return results
  }

  return permute(inputArr, [])
}

const ingAlcMaps = permutator(_.keys(alchemicals))
// a golem map looks like:
// [{affects: 'ears', size: -1}, 'nothing', {affects: 'chest', size: 1}]
const golemMaps = _.flatMap(permutator(['ears', 'chest', 'nothing']), (permutedAffects) =>
  _.flatMap(_.values([-1,1]), (size1) =>
    _.map(_.values([-1,1]), (size2) => {
      let world = permutedAffects.slice()
      const earsIndex = _.findIndex(world, (value) => value === 'ears')
      world[earsIndex] = {affects: 'ears', size: size1}
      const chestIndex = _.findIndex(world, (value) => value === 'chest')
      world[chestIndex] = {affects: 'chest', size: size2}
      return world
    })
  )
)

function worldGenerator(golemMode) {
  let golemOpts
  if (golemMode) {
    golemOpts = golemMaps.slice()
  } else {
    //We give non-expansion worlds an arbitrary array of length 1
    //so that multiplicity computations work (see worldWeight)
    golemOpts = ["golems don't matter"]
  }
  return ingAlcMaps.map((ingAlcMap) => ({ingAlcMap: ingAlcMap, multiplicity: 1, golemMaps: golemOpts}))
}

export {worldGenerator}
