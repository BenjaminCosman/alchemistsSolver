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

function distance(array1, array2) {
  return _.sum(_.zipWith(array1, array2, (a, b) => a === b ? 0 : 1))
}

function PublishView(props) {
  var data = tableInfo(props.worlds)
  let [certainIngredients, hedgeIngredients] = theories(data)

  return (
    <div>
      <div>Remaining worlds: {props.worlds.length}</div>
      <div>Certain ingredients: {certainIngredients}</div>
      <div>Hedge ingredients: {hedgeIngredients}</div>
      <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn/>
            {ingredients.map((name, index) => <TableHeaderColumn key={index}><Image source={require('../images/ingredients/' + name + '.png')}/></TableHeaderColumn>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((rowInfo, index) => <SheetRow key={index} rowInfo={rowInfo} index={index}/>)}
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

function theories(data) {
  var certainIngredients = 0
  var hedgeIngredients = 0
  for (var col = 0; col < 8; col++) {
    var options = []
    for (var row = 0; row < 8; row++) {
      if (data[row][col] > 0) {
        options.push(alchemicals[row])
      }
    }
    if (options.length === 1) {
      certainIngredients++
    } else if (options.length === 2 && distance(options[0], options[1]) === 1) {
      hedgeIngredients++
    }
  }
  return [certainIngredients, hedgeIngredients]
}

export {PublishView, tableInfo, theories}
