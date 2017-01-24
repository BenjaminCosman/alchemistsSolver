import {alchemicals, ingredients} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {worldWeight} from './App.js'

import React from 'react'

import math from 'mathjs'
import _ from 'lodash'

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'

function SheetCell(props) {
  let extra = <div/>
  const color = props.hedges[props.ingredient]
  if (props.cellInfo === 1) {
    extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gold"/></div>
  } else if (props.cellInfo > 0) {
    if (color !== undefined) {
      extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name={color}/></div>
    }
  }

  let percentage = Math.round(props.cellInfo * 100, 0)
  if (percentage === 0 && props.cellInfo !== 0) {
    percentage = "<1"
  } else if (percentage === 100 && props.cellInfo !== 1) {
    percentage = ">99"
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
  const data = tableInfo(props.worlds)

  return (
    <div>
      <div>Remaining worlds: {_.sumBy(props.worlds, (world) => world.golemMaps.length)}</div>
      <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn/>
            {ingredients.map((name) => <TableHeaderColumn key={name}><MyIcon imageDir="ingredients" name={name}/></TableHeaderColumn>)}
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

  let result = [
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
      result[alchemical][index] += worldWeight(world)
    })
  })

  const denominator = _.sum(result[0])

  return math.dotMultiply(result, 1/denominator)
}

function theories(data) {
  let certainIngredients = []
  let hedgeIngredients = {}
  for (let col = 0; col < 8; col++) {
    let options = []
    for (let row = 0; row < 8; row++) {
      if (data[row][col] > 0) {
        options.push(alchemicals[row])
      }
    }
    if (options.length === 1) {
      certainIngredients.push(col)
    } else if (options.length === 2) {
      const differingAspects = _.zipWith(options[0], options[1], (a, b) => a === b ? 0 : 1)
      if (_.sum(differingAspects) === 1) {
        hedgeIngredients[col] = differingAspects.indexOf(1)
      }
    }
  }
  return [certainIngredients, hedgeIngredients]
}

export {PublishView, tableInfo, theories}
