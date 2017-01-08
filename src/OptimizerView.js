import {ingredients, potionsInverted} from './Enums.js'
import {mixInWorld} from './Logic.js'

import React from 'react'

import _ from 'lodash'

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
  var foos = []

  _.forEach(_.keys(ingredients), (ingredient1) => {
    _.forEach(_.keys(ingredients), (ingredient2) => {
      if (ingredient1 < ingredient2) {
        var bits = entropy(partitionWorlds([ingredient1, ingredient2], props.worlds))
        foos.push({ingredient1:ingredient1, ingredient2:ingredient2, bits:bits})
      }
    })
  })

  return <Table>
    {/* <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
      <TableRow>
        <TableHeaderColumn/>
        {ingredients.map((name, index) => <TableHeaderColumn key={index}><Image source={require('../images/ingredients/' + name + '.png')}/></TableHeaderColumn>)}
      </TableRow>
    </TableHeader> */}
    <TableBody>
      {foos.map((rowInfo, index) => <SheetRow key={index} rowInfo={rowInfo} index={index}/>)}
    </TableBody>
  </Table>
}

function SheetRow(props) {
  return (
    <TableRow>
      <TableRowColumn>{props.rowInfo.ingredient1}</TableRowColumn>
      <TableRowColumn>{props.rowInfo.ingredient2}</TableRowColumn>
      <TableRowColumn>{props.rowInfo.bits}</TableRowColumn>
    </TableRow>
  )
}

export {OptimizerView}
