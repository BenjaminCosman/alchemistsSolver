import {worldWeight, partitionWeight} from './Logic.js'
import {toPercentageString} from './Misc.js'

import React from 'react'

import _ from 'lodash'

import Button from 'antd/lib/button'


function countWorlds(worlds) {
  return _.sumBy(worlds, (world) => world.golemMaps.length)
}

function updatePartitions(partitions, world, studiedIngredients) {
  const fingerprint = _.filter(world.ingAlcMap, (alc, ing) => studiedIngredients.has(ing)).join("")
  if (fingerprint in partitions) {
    partitions[fingerprint].push(world)
  } else {
    partitions[fingerprint] = [world]
  }
}

class Explorer extends React.Component {
  state = {
    summary: true,
    exploreIndex: 0
  }

  componentWillReceiveProps(nextProps) {
    //TODO: is there a case where this resets state inappropriately?
    this.setState({summary: true, exploreIndex: 0})
  }

  render() {
    let worlds = this.props.worlds
    let worldTracker
    if (this.state.summary) {
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

        worlds = partitions[this.state.exploreIndex]
        const probability = toPercentageString(partitionWeight(worlds)/partitionWeight(this.props.worlds))
        total = partitions.length
        trackerText = "Partition " + (1+this.state.exploreIndex) + " of " + total + " (probability " + probability + "%)"
      } else {
        total = countWorlds(worlds)
        trackerText = "World " + (1+this.state.exploreIndex) + " of " + total

        let worldIndex = 0
        let skippedWeight = 0
        while (true) {
          let weight = worldWeight(this.props.worlds[worldIndex])
          if (skippedWeight + weight <= this.state.exploreIndex) {
            skippedWeight += weight
            worldIndex++
          } else {
            let world = this.props.worlds[worldIndex]
            if (worldWeight(world) > 1) {
              world = _.clone(world)
              world.golemMaps = [world.golemMaps[this.state.exploreIndex - skippedWeight]]
            }
            worlds = [world]
            break
          }
        }
      }
      worldTracker = <div>
        {trackerText}
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
