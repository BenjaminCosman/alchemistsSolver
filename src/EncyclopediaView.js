import {potions, alchemicals} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {worldWeight} from './App.js'
import {toPercentageString} from './Misc.js'

import React from 'react'

import math from 'mathjs'
import _ from 'lodash'

import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table'


const ENC_CERTAIN = 0
const ENC_HEDGE = 1
const ENC_NONE = 2

function classify(row) {
  const pluses = _.filter(row, v => v === 1).length
  const minuses = _.filter(row, v => v === 0).length
  if (pluses >= 2 && minuses >= 2) { // you can also publish 4-0, but then you actually know 4-4
    return ENC_CERTAIN
  } else if (pluses + minuses >= 3) {
    return ENC_HEDGE
  }
  return ENC_NONE
}

function SheetCell(props) {
  return <TableRowColumn>{toPercentageString(props.cellInfo)}</TableRowColumn>
}

function SheetRow(props) {
  let extra
  const sealStrength = classify(props.rowInfo)
  if (sealStrength === ENC_CERTAIN) {
    extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gold"/></div>
  } else if (sealStrength === ENC_HEDGE) {
    extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gray"/></div>
  } else { // ENC_NONE
    extra = <div/>
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

function encyclopediaTheories(worlds) {
  let hedge = 0
  let certain = 0
  _.forEach(tableInfo(worlds), (row) => {
    const result = classify(row)
    if (result === ENC_CERTAIN) {
      certain++
    } else if (result === ENC_HEDGE) {
      hedge++
    }
  })
  return [certain, hedge]
}

export {EncyclopediaView, encyclopediaTheories}
