import {worldWeight} from './Logic.js'

import React from 'react'

import _ from 'lodash'

import Button from 'antd/lib/button'


function countWorlds(worlds) {
  return _.sumBy(worlds, (world) => world.golemMaps.length)
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
        <Button size="small" onClick={() => this.setState({summary: false})}>Explore</Button>
      </div>
    } else {
      const total = countWorlds(worlds)
      worldTracker = <div>
        {"World " + (1+this.state.currentWorld) + " of " + total}
        <Button size="small" onClick={() => this.setState({summary: true})}>Summary</Button>
        <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld - 1 + total) % total})}>-</Button>
        <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld + 1) % total})}>+</Button>
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

    return (
      <div>
        {worldTracker}
        {this.props.children.map(f => f(worlds))}
      </div>
    )
  }
}

export {Explorer}
