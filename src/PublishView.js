import {alchemicals, ingredients} from './Enums.js'
import {MyIcon} from './MyIcon.js'

import React from 'react'

import math from 'mathjs'
import _ from 'lodash'

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'

function SheetCell(props) {
  let percentage = Math.round(props.cellInfo * 100, 0)
  let extra = <div/>

  let color = props.hedges[props.ingredient]
  if (percentage === 100) {
    extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gold"/></div>
  } else if (percentage > 0) {
    if (color !== undefined) {
      extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name={color}/></div>
    }
  }
  return <TableRowColumn>{percentage}{extra}</TableRowColumn>
}

function SheetRow(props) {
  return (
    <TableRow>
      <TableRowColumn><MyIcon imageDir="alchemicals" name={alchemicals[props.index].join("")} /></TableRowColumn>
      {props.rowInfo.map((cellInfo, index) => <SheetCell key={index} cellInfo={cellInfo} hedges={props.hedges} ingredient={index}/>)}
    </TableRow>
  )
}

function PublishView(props) {
  var data = tableInfo(props.worlds)

  return (
    <div>
      <div>Remaining worlds: {props.worlds.length}</div>
      <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn/>
            {ingredients.map((name, index) => <TableHeaderColumn key={index}><MyIcon imageDir="ingredients" name={name}/></TableHeaderColumn>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((rowInfo, index) => <SheetRow key={index} rowInfo={rowInfo} index={index} hedges={theories(data)[1]}/>)}
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
  var certainIngredients = []
  var hedgeIngredients = {}
  for (var col = 0; col < 8; col++) {
    var options = []
    for (var row = 0; row < 8; row++) {
      if (data[row][col] > 0) {
        options.push(alchemicals[row])
      }
    }
    if (options.length === 1) {
      certainIngredients.push(col)
    } else if (options.length === 2) {
      let differingAspects = _.zipWith(options[0], options[1], (a, b) => a === b ? 0 : 1)
      if (_.sum(differingAspects) === 1) {
        hedgeIngredients[col] = differingAspects.indexOf(1)
      }
    }
  }
  return [certainIngredients, hedgeIngredients]
}

export {PublishView, tableInfo, theories}
