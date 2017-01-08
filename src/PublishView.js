import AboutDialog from './AboutDialog.js'
import HelpDialog from './HelpDialog.js'
import {AddTwoIngredientFactDialog, AddOneIngredientFactDialog, AddLibraryFactDialog, AddGolemTestFactDialog} from './FactDialogs.js'
import {alchemicals, ingredients} from './Enums.js'

import {Image, View} from 'react-native'
import React from 'react'

import math from 'mathjs'

import _ from 'lodash'

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'


const style = {
  margin: 12,
}

function SheetCell(props) {
  var percentage = Math.round(props.cellInfo * 100, 0)
  return <TableRowColumn>{percentage}</TableRowColumn>
}

function SheetRow(props) {
  return (
    <TableRow>
      <TableRowColumn><Image resizeMode={"contain"} source={require("../images/alchemicals/" + alchemicals[props.index].join("") + ".png")} /></TableRowColumn>
      {props.rowInfo.map((cellInfo, index) => <SheetCell key={index} cellInfo={cellInfo}/>)}
    </TableRow>
  )
}

function ReactFact(props) {
  return <li>
    <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      {props.item}
      <RaisedButton onTouchTap={props.deleteFact} style={style}>Delete</RaisedButton>
    </View>
  </li>
}

function PublishView(props) {
  var probabilityVisualizer
  if (props.worlds.length === 0) {
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
        {tableInfo(props.worlds).map((rowInfo, index) => <SheetRow key={index} rowInfo={rowInfo} index={index}/>)}
      </TableBody>
    </Table>
  }

  var expansionFactDialogs = []
  if (props.golemMode) {
      expansionFactDialogs = [
        <AddLibraryFactDialog handleSubmit={props.handleSubmit} key={0}/>,
        <AddGolemTestFactDialog handleSubmit={props.handleSubmit} key={1}/>,
        <FlatButton label="Add Golem Animation Fact (Coming soon!)" disabled={true} key={2}/>,
      ]
  }

  return (
    <div>
      <ul>
        {props.factlist.map((fact, factIndex) => <ReactFact key={factIndex} item={fact.render()} deleteFact={() => {props.deleteFact(factIndex)}} />)}
      </ul>

      <AddTwoIngredientFactDialog handleSubmit={props.handleSubmit}/>
      <AddOneIngredientFactDialog handleSubmit={props.handleSubmit}/>
      {expansionFactDialogs}

      <div>Remaining worlds: {props.worlds.length}</div>

      {probabilityVisualizer}

      <HelpDialog/>
      <AboutDialog/>
    </div>
  )
}

function tableInfo(worlds) {

  var result = [
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
  ]

  _.forEach(worlds, (world) => {
    _.forEach(world.ingAlcMap, (alchemical, index) => {
      result[alchemical][index] += world.multiplicity
    })
  })

  var denominator = _.sum(result[0])

  return math.dotMultiply(result, 1/denominator)
}

export {PublishView}
