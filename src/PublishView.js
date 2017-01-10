import {alchemicals, ingredients} from './Enums.js'

import {Image} from 'react-native'
import React from 'react'

import math from 'mathjs'
import _ from 'lodash'

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'

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

function PublishView(props) {
  return (
    <div>
      <div>Remaining worlds: {props.worlds.length}</div>
      <Table>
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
