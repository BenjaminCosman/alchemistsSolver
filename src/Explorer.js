import {worldWeight} from './Logic.js'
import {ingredients} from './Enums.js'

import React from 'react'

import _ from 'lodash'

import Button from 'antd/lib/button'


function countWorlds(worlds) {
  return _.sumBy(worlds, (world) => world.golemMaps.length)
}

function updatePartitions(partitions, world, ignoredIngredients) {
  const fingerprint = _.filter(world.ingAlcMap, (alc, ing) => !ignoredIngredients.includes(ing)).join("")
  if (fingerprint in partitions) {
    partitions[fingerprint].push(world)
  } else {
    partitions[fingerprint] = [world]
  }
}

class Explorer extends React.Component {
  state = {
    summary: true,
    currentWorld: 0
  }

  componentWillReceiveProps(nextProps) {
    // reset to Summary mode if worlds changes (as hopefully indicated by countWorlds)
    if (countWorlds(this.props.worlds) !== countWorlds(nextProps.worlds)) {
      this.setState({summary: true, currentWorld: 0})
    }
  }

  render() {
    let worlds = this.props.worlds
    let worldTracker
    if (this.state.summary) {
      worldTracker = <div>
        Remaining worlds: {countWorlds(worlds)}
        <Button size="small" onClick={() => this.setState({summary: false})} key="explore">Explore</Button>
      </div>
    } else {
      if (!this.props.expansion) {
        let ignoredIngredients = [4,5,6] //TODO: hardcoded for testing
        let partitions = {}
        _.forEach(worlds, world => {
          updatePartitions(partitions, world, ignoredIngredients)
        })
        partitions = _.values(partitions)
        const total = partitions.length

        worldTracker = <div>
          {"Partition " + (1+this.state.currentWorld) + " of " + total}
          <Button size="small" onClick={() => this.setState({summary: true})} key="summary">Summary</Button>
          <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld - 1 + total) % total})} key="+">-</Button>
          <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld + 1) % total})} key="-">+</Button>
        </div>

        worlds = partitions[this.state.currentWorld]
      } else {
      const total = countWorlds(worlds)
      worldTracker = <div>
        {"World " + (1+this.state.currentWorld) + " of " + total}
        <Button size="small" onClick={() => this.setState({summary: true})} key="summary">Summary</Button>
        <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld - 1 + total) % total})} key="+">-</Button>
        <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld + 1) % total})} key="-">+</Button>
      </div>

      let worldIndex = 0
      let skippedWeight = 0
      while (true) {
        let weight = worldWeight(this.props.worlds[worldIndex])
        if (skippedWeight + weight <= this.state.currentWorld) {
          skippedWeight += weight
          worldIndex++
        } else {
          let world = this.props.worlds[worldIndex]
          if (worldWeight(world) > 1) {
            world = _.clone(world)
            world.golemMaps = [world.golemMaps[this.state.currentWorld - skippedWeight]]
          }
          worlds = [world]
          break
        }
      }
      // console.log(worldIndex)
      }
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
