import {alchemicals} from './Enums.js'
import _ from 'lodash'

function worldGenerator(golemMode) {
  var mainWorlds = permutator(_.keys(alchemicals))
  var worlds = []
  if (golemMode) {
    var golemWorlds = golemWorldGenerator()
    _.forEach(mainWorlds, (mainWorld) => {
      _.forEach(golemWorlds, (golemWorld) => {
        worlds.push({ingAlcMap: mainWorld, golemMap: golemWorld, multiplicity: 1})
      })
    })
  } else {
    worlds = mainWorlds.map((world) => {return {ingAlcMap: world, multiplicity: 1}})
  }
  return worlds
}

// http://stackoverflow.com/a/20871714/6036628
function permutator(inputArr) {
  var results = []

  function permute(arr, memo) {
    var cur = memo

    for (var i = 0; i < arr.length; i++) {
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

// a golem world looks like:
// [{affects: 'ears', size: -1}, 'nothing', {affects: 'chest', size: 1}]
function golemWorldGenerator() {
  var affects = ['ears', 'chest', 'nothing']
  var worlds = _.map(permutator(affects), (world) => {
    var outList = []
    _.forEach(_.values([-1,1]), (size1) => {
      _.forEach(_.values([-1,1]), (size2) => {
        var newWorld = _.slice(world)
        var earsIndex = _.findIndex(newWorld, (value) => value === 'ears')
        newWorld[earsIndex] = {affects: 'ears', size: size1}
        var chestIndex = _.findIndex(newWorld, (value) => value === 'chest')
        newWorld[chestIndex] = {affects: 'chest', size: size2}
        outList.push(newWorld)
      })
    })
    return outList
  })
  return _.flatten(worlds)
}

export {worldGenerator}
