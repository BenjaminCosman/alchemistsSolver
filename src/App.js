// === UI stuff ===
//TODO add refresh indicators http://www.material-ui.com/#/components/refresh-indicator
//TODO downsize columns (and rows)

// === Additional views ===
//TODO add view to see individual worlds when you have just a few
//TODO add view for best things to mix for the adventurer

// === Refactoring ===
//TODO split up FactDialogs.js

// === Other stuff ===
//TODO make Facts into React Components
//TODO fix lag issues
//TODO get test file working
//TODO (periodically?) filter package.json unneeded packages

// The expected number of bits of information from real science is
// -[1/7*lg(1/7) * 7]
// = 2.807 bits

// The expected number of bits of information from experimenting randomly on an adventurer is
// -[1/7*lg(1/7) + 2/7*lg(2/7) + 1/7*lg(1/7) + 3/7*lg(3/7)]
// = 1.842 bits

import ExpansionSelectorDialog from './ExpansionSelectorDialog.js'
import {alchemicals} from './Enums.js'
import {PublishView} from './PublishView.js'

import {Tabs, Tab} from 'material-ui/Tabs';


import React from 'react'
import './App.css'

import _ from 'lodash'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

class AlchemistsSolverApp extends React.Component {
  mixins = [PureRenderMixin]

  state = {
    golemMode: false,
    factlist: [],
  }
  handleSubmit = (newFact) => {
    this.setState({
      factlist: this.state.factlist.concat([newFact]),
    })
  }
  render() {
    var mainWorlds = permutator(_.keys(alchemicals))
    var worlds = []
    if (this.state.golemMode) {
      var golemWorlds = golemWorldGenerator()
      _.forEach(mainWorlds, (mainWorld) => {
        _.forEach(golemWorlds, (golemWorld) => {
          worlds.push({ingAlcMap: mainWorld, golemMap: golemWorld, multiplicity: 1})
        })
      })
    } else {
      worlds = mainWorlds.map((world) => {return {ingAlcMap: world, multiplicity: 1}})
    }

    _.forEach(this.state.factlist, (fact) => {
      _.forEach(worlds, fact.updatePrior)
      worlds = _.filter(worlds, (world) => world.multiplicity !== 0)
    })

    return (
      <MuiThemeProvider>
        <Tabs>
          <Tab label="Publishing" >
            <ExpansionSelectorDialog callback={() => this.setState({golemMode:true})}/>
            <PublishView
              golemMode={this.state.golemMode}
              factlist={this.state.factlist}
              worlds={worlds}
              handleSubmit={this.handleSubmit}
              deleteFact={this.deleteFact}
            />
          </Tab>
          <Tab label="Experiment Optimizer" >
            <div/>
          </Tab>
        </Tabs>
      </MuiThemeProvider>
    )
  }
  deleteFact = (deleteIndex) => {
    this.setState({factlist: removeAtIndex(this.state.factlist, deleteIndex)})
  }
}


// non-mutating
function removeAtIndex(arr, index) {
  return _.filter(arr, function(val, idx) {return idx !== index})
}

// var ColorMapping = {
//   0: "red",
//   1: "green",
//   2: "blue",
// }

// var SignMapping = {
//   -1: "minus",
//   0: "neutral",
//   1: "plus",
// }

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

export default AlchemistsSolverApp
