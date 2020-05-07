import {worldWeight, partitionWeight} from './Logic.js'
import {toPercentageString} from './Misc.js'

import React from 'react'

import _ from 'lodash'

import Button from 'antd/lib/button'


function countWorlds(worlds) {
  return _.sumBy(worlds, world => world.golemMaps.length)
}

function updatePartitions(partitions, world, studiedIngredients) {
  const fingerprint = _.filter(world.ingAlcMap, (alc, ing) => studiedIngredients.has(ing)).join("")
  if (fingerprint in partitions) {
    partitions[fingerprint].push(world)
  } else {
    partitions[fingerprint] = [world]
  }
}

function seekWorld(worlds, exploreIndex) {
  let skippedWeight = 0
  for (let i = 0; i < worlds.length; i++) {
    let world = worlds[i]
    let weight = worldWeight(world)
    if (skippedWeight + weight <= exploreIndex) {
      skippedWeight += weight
    } else {
      if (weight > 1) {
        world = _.clone(world)
        world.golemMaps = [world.golemMaps[exploreIndex - skippedWeight]]
      }
      return world
    }
  }
  throw new Error("seekWorld: should be unreachable")
}

function Explorer({worlds, golem, studiedIngredients, children}) {
  const [summary, setSummary] = React.useState(true)
  const [exploreIndex, setExploreIndex] = React.useState(0)
  const [worldsCount, setWorldsCount] = React.useState(0)

  const newCount = countWorlds(worlds)
  if (newCount !== worldsCount) {
    setExploreIndex(0)
    setWorldsCount(newCount)
    return null //shortcircuit and re-render since we changed state
  }

  let worldTracker
  let worldsOfInterest = worlds
  if (summary) {
    //TODO this seems fragile...
    const disableExplore = (!golem && partitionWeight(worlds) === 40320)
                        || (golem && partitionWeight(worlds) === 967680)
    worldTracker = <div>
      Remaining worlds: {countWorlds(worlds)}
      <Button size="small" onClick={() => setSummary(false)} key="explore" disabled={disableExplore}>Explore</Button>
    </div>
  } else {
    let total
    let trackerText
    if (!golem) {
      let partitions = {}
      _.forEach(worlds, world => {
        updatePartitions(partitions, world, studiedIngredients)
      })
      partitions = _.sortBy(partitions, p => -(partitionWeight(p)))

      total = partitions.length
      // Defensively moding by total here and below in case a props change has put it out of bounds,
      // though getDerivedStateFromProps should prevent that from happening
      worldsOfInterest = partitions[exploreIndex % total]
      trackerText = "Partition "
    } else {
      total = countWorlds(worlds)
      worldsOfInterest = [seekWorld(worlds, exploreIndex % total)]
      trackerText = "World "
    }
    const probability = toPercentageString(partitionWeight(worldsOfInterest)/partitionWeight(worlds))
    worldTracker = <div>
      {trackerText + (1+(exploreIndex % total)) + " of " + total + " (probability " + probability + "%)"}
      <Button size="small" onClick={() => setSummary(true)} key="summary">Summary</Button>
      <Button size="small" onClick={() => setExploreIndex((exploreIndex - 1 + total) % total)} key="+">-</Button>
      <Button size="small" onClick={() => setExploreIndex((exploreIndex + 1) % total)} key="-">+</Button>
    </div>
  }

  return <>
    {worldTracker}
    {children.map(f => f(worldsOfInterest))}
  </>
}

export {Explorer}
