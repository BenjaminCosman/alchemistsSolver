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

import AboutDialog from './AboutDialog.js'
import HelpDialog from './HelpDialog.js'
import {AddTwoIngredientFactDialog, AddOneIngredientFactDialog, AddLibraryFactDialog} from './FactDialogs.js'
import {Image, View} from 'react-native'
import {alchemicals, ingredients} from './Enums.js'

import React from 'react'
import './App.css'

import _ from 'lodash'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Toggle from 'material-ui/Toggle'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

const style = {
  margin: 12,
}

// This is what an Alchemical looks like:
// [1, 1, -1]

function ReactFact(props) {
  return <li>
    <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      {props.item}
      <RaisedButton onTouchTap={props.deleteFact} style={style}>Delete</RaisedButton>
    </View>
  </li>
}

function getWeight(weightedWorldList) {
  return _.sumBy(weightedWorldList, function(weightedWorld) {return weightedWorld.multiplicity})
}

function SheetCell(props) {
  var worlds = _.filter(props.worlds, function(world) {
    return _.isEqual(world.ingAlcMap[props.ingredientIndex], props.alchemical)
  })
  var percentage = Math.round(100 * getWeight(worlds) / getWeight(props.worlds), 0)
  return <TableRowColumn>{percentage}</TableRowColumn>
}

function SheetRow(props) {
  return (
    <TableRow>
      <TableRowColumn><Image resizeMode={"contain"} source={require("../images/alchemicals/" + props.alchemical.join("") + ".png")} /></TableRowColumn>
      {ingredients.map((ingredient, index) => <SheetCell ingredientIndex={index} alchemical={props.alchemical} key={index} worlds={props.worlds}/>)}
    </TableRow>
  )
}

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
  toggleGolemMode = () => {
    this.setState({golemMode: !this.state.golemMode})
  }
  render() {
    var worlds = _.map(permutator(alchemicals), (world) => {return {ingAlcMap: world, multiplicity: 1}})
    _.forEach(this.state.factlist, (fact) => {
      _.forEach(worlds, fact.updatePrior)
      worlds = _.filter(worlds, (world) => world.multiplicity !== 0)
    })

    var probabilityVisualizer
    if (worlds.length === 0) {
      probabilityVisualizer = <div>
        <h1>Your facts are contradictory.</h1>
        Check them and delete any you may have entered incorrectly, or read the
        Help section to make sure you know the format and meaning of the facts.
      </div>
    } else {
      probabilityVisualizer = <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn/>
            {ingredients.map((name, index) => <TableHeaderColumn key={index}><Image source={require('../images/ingredients/' + name + '.png')}/></TableHeaderColumn>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {alchemicals.map((alchemical, index) => <SheetRow alchemical={alchemical} key={index} worlds={worlds}/>)}
        </TableBody>
      </Table>
    }

    var expansionFactDialogs = []
    if (this.state.golemMode) {
        expansionFactDialogs = [
          <AddLibraryFactDialog handleSubmit={this.handleSubmit}/>,
          <FlatButton label="Add Golem Test Fact (Coming soon!)" disabled={true}/>,
          <FlatButton label="Add Golem Animation Fact (Coming soon!)" disabled={true}/>,
        ]
    }

    return (
      <MuiThemeProvider>
        <div>
          <h3>Alchemists Solver</h3>

          <Toggle
            onToggle={this.toggleGolemMode}
            label="Use King's Golem expansion"
            labelPosition="right"
          />

          <ul>
            {this.state.factlist.map((fact, factIndex) => <ReactFact key={factIndex} item={fact.render()} deleteFact={() => {this.deleteFact(factIndex)}} />)}
          </ul>

          <AddTwoIngredientFactDialog handleSubmit={this.handleSubmit}/>
          <AddOneIngredientFactDialog handleSubmit={this.handleSubmit}/>
          {expansionFactDialogs}

          <div>Remaining worlds: {worlds.length}</div>

          {probabilityVisualizer}

          <HelpDialog/>
          <AboutDialog/>
        </div>
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

export default AlchemistsSolverApp
