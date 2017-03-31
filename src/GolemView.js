import {potions} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {worldWeight} from './App.js'

import React from 'react'

import math from 'mathjs'
import _ from 'lodash'

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'


const GOL_CERTAIN = 0
const GOL_HEDGE = 1
const GOL_NONE = 2

function classify(row) {
  //TODO
  return GOL_NONE
}

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
  let extra
  const sealStrength = classify(props.rowInfo)
  if (sealStrength === GOL_CERTAIN) {
    extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gold"/></div>
  } else if (sealStrength === GOL_HEDGE) {
    extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gray"/></div>
  } else { // GOL_NONE
    extra = <div/>
  }

  return (
    <TableRow>
      <TableRowColumn><MyIcon imageDir="golemTest" name={['ears', 'chest'][props.index]} />{extra}</TableRowColumn>
      {props.rowInfo.map((cellInfo, index) => <SheetCell key={index} cellInfo={cellInfo} ingredient={index}/>)}
    </TableRow>
  )
}

function GolemView(props) {
  const data = tableInfo(props.worlds)
  //TODO same order as sheet, e.g. const names = ["Blue+", "Blue-", "Green+", "Green-", "Red+", "Red-"]
  return (
    <div>
      <h2>Golem</h2>
      <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn/>
            {_.slice(_.keys(potions), 0, 6).map((name) => <TableHeaderColumn key={name}><MyIcon imageDir="coloredCircles" name={name}/></TableHeaderColumn>)}
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
  let result = [
    [0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0,],
  ]
  let denominator = 0

  _.forEach(worlds, (world) => {
    denominator += worldWeight(world)
    _.forEach(world.golemMaps, (golemMap) => {
      _.forEach(golemMap, (effect, index) => {
        if (effect !== 'nothing') {
          let row = effect.affects === 'ears' ? 0 : 1
          let col = 2*index + (effect.size === 1 ? 0 : 1)
          result[row][col] += world.multiplicity
        }
      })
    })
  })

  return math.dotMultiply(result, 1/denominator)
}

export {GolemView}
