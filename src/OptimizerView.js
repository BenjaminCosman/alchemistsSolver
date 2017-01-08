import {ingredients, potionsInverted} from './Enums.js'
import {mixInWorld} from './Logic.js'
import {MyIcon} from './MyIcon.js'

import React from 'react'

import _ from 'lodash'
import math from 'mathjs'

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'


function entropy(partitionedWorlds) {
  var counts = _.map(partitionedWorlds, (block) => {
    return _.sumBy(block, (world) => world.multiplicity)
  })
  var denominator = _.sum(counts)
  return _.sumBy(counts, (count) => {
    var p = count/denominator
    if (p === 0) {
      return 0
    }
    return -p * Math.log2(p)
  })
}

function partitionWorlds(ingredients, worlds) {
  var partitionedWorlds = [[],[],[],[],[],[],[]]
  _.forEach(worlds, (world) => {
    var potion = mixInWorld(world, ingredients)
    var partition = potionsInverted[potion]
    partitionedWorlds[partition].push(world)
  })
  return partitionedWorlds
}

function OptimizerView(props) {
  var rows = []

  _.forEach(_.keys(ingredients), (ingredient1) => {
    _.forEach(_.keys(ingredients), (ingredient2) => {
      if (ingredient1 < ingredient2) {
        var bits = entropy(partitionWorlds([ingredient1, ingredient2], props.worlds))
        rows.push({ingredient1:ingredient1, ingredient2:ingredient2, bits:bits})
      }
    })
  })

  return <Table>
    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
      <TableRow>
        <TableHeaderColumn/>
        <TableHeaderColumn/>
        <TableHeaderColumn>Expected bits of info from this experiment</TableHeaderColumn>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((rowInfo, index) => <SheetRow key={index} rowInfo={rowInfo} index={index}/>)}
    </TableBody>
  </Table>
}

function SheetRow(props) {
  return (
    <TableRow>
      <TableRowColumn><MyIcon imageDir="ingredients" name={ingredients[props.rowInfo.ingredient1]}/></TableRowColumn>
      <TableRowColumn><MyIcon imageDir="ingredients" name={ingredients[props.rowInfo.ingredient2]}/></TableRowColumn>
      <TableRowColumn>{math.round(props.rowInfo.bits, 1)}</TableRowColumn>
    </TableRow>
  )
}

export {OptimizerView}
