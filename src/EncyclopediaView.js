import {potions, alchemicals} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {worldWeight} from './App.js'

import React from 'react'

import math from 'mathjs'
import _ from 'lodash'

import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table'

function SheetCell(props) {
  let percentage = Math.round(props.cellInfo * 100, 0)
  if (percentage === 0 && props.cellInfo !== 0) {
    percentage = "<1"
  } else if (percentage === 100 && props.cellInfo !== 1) {
    percentage = ">99"
  }
  return <TableRowColumn>{percentage}</TableRowColumn>
}

function SheetRow(props) {
  let extra = <div/>
  const pluses = _.filter(props.rowInfo, v => v === 1).length
  const minuses = _.filter(props.rowInfo, v => v === 0).length
  if (pluses >= 2 && minuses >= 2) {
    extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gold"/></div>
  } else if (pluses + minuses >= 3) {
    extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gray"/></div>
  }
  return (
    <TableRow>
      <TableRowColumn><MyIcon imageDir="aspects" name={_.keys(potions)[props.index*2]} />{extra}</TableRowColumn>
      {props.rowInfo.map((cellInfo, index) => <SheetCell key={index} cellInfo={cellInfo} ingredient={index}/>)}
    </TableRow>
  )
}

function EncyclopediaView(props) {
  const data = tableInfo(props.worlds)
  return (
    <div>
      <h2>Encyclopedia</h2>
      <Table>
        <TableBody>
          {data.map((rowInfo, index) => <SheetRow key={index} rowInfo={rowInfo} index={index}/>)}
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
  ]

  let denominator = 0
  _.forEach(worlds, (world) => {
    denominator += worldWeight(world)
    _.forEach(world.ingAlcMap, (alchemical, ingredient) => {
      _.forEach(alchemicals[alchemical], (sign, aspectIndex) => {
        if (sign === +1) {
          result[aspectIndex][ingredient] += worldWeight(world)
        }
      })
    })
  })

  return math.dotMultiply(result, 1/denominator)
}

export {EncyclopediaView}
