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

class Explorer extends React.Component {
  state = {
    summary: true,
    exploreIndex: 0,
    worldsCount: 0
  }

  static getDerivedStateFromProps(props, state) {
    let newCount = countWorlds(props.worlds);
    if (newCount !== state.worldsCount) {
      state["exploreIndex"] = 0;
      state["worldsCount"] = newCount;
      return state;
    } else {
      // Return null to indicate no change to state.
      return null;
    }
  }

  render() {
    let worlds = this.props.worlds
    let worldTracker
    if (this.state.summary) {
      //TODO this seems fragile...
      const disableExplore = (!this.props.golem && partitionWeight(worlds) === 40320)
                          || (this.props.golem && partitionWeight(worlds) === 967680)
      worldTracker = <div>
        Remaining worlds: {countWorlds(worlds)}
        <Button size="small" onClick={() => this.setState({summary: false})} key="explore" disabled={disableExplore}>Explore</Button>
      </div>
    } else {
      let total
      let trackerText
      if (!this.props.golem) {
        let partitions = {}
        _.forEach(worlds, world => {
          updatePartitions(partitions, world, this.props.studiedIngredients)
        })
        partitions = _.sortBy(partitions, p => -(partitionWeight(p)))

        total = partitions.length
        // Defensively moding by total here and below in case a props change has put it out of bounds,
        // though getDerivedStateFromProps should prevent that from happening
        worlds = partitions[this.state.exploreIndex % total]
        trackerText = "Partition "
      } else {
        total = countWorlds(worlds)
        worlds = [seekWorld(worlds, this.state.exploreIndex % total)]
        trackerText = "World "
      }
      const probability = toPercentageString(partitionWeight(worlds)/partitionWeight(this.props.worlds))
      worldTracker = <div>
        {trackerText + (1+(this.state.exploreIndex % total)) + " of " + total + " (probability " + probability + "%)"}
        <Button size="small" onClick={() => this.setState({summary: true})} key="summary">Summary</Button>
        <Button size="small" onClick={() => this.setState({exploreIndex: (this.state.exploreIndex - 1 + total) % total})} key="+">-</Button>
        <Button size="small" onClick={() => this.setState({exploreIndex: (this.state.exploreIndex + 1) % total})} key="-">+</Button>
      </div>
    }

    return (
      <div>
        {worldTracker}
        {this.props.children.map(f => f(worlds))}
      </div>
    )
  }
}

export {Explorer}
