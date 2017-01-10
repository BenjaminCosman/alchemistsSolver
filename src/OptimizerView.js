import {ingredients, potionsInverted} from './Enums.js'
import {mixInWorld} from './Logic.js'
import {MyIcon} from './MyIcon.js'

import React from 'react'

import _ from 'lodash'
import math from 'mathjs'

import {Table} from 'antd'
import 'antd/dist/antd.css'

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
  var key = 0
  _.forEach(_.keys(ingredients), (ingredient1) => {
    _.forEach(_.keys(ingredients), (ingredient2) => {
      if (ingredient1 < ingredient2) {
        var bits = entropy(partitionWorlds([ingredient1, ingredient2], props.worlds))
        rows.push({ingredients:[ingredient1, ingredient2], bits:math.round(bits, 1), key:key})
        key++
      }
    })
  })

  const columns = [{
    title: 'Ingredients to mix',
    dataIndex: 'ingredients',
    key: 'ingredients',
    render: ings => <div>
      <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[0]]}/></div>
      <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[1]]}/></div>
    </div>
  }, {
    title: 'Expected bits of information',
    dataIndex: 'bits',
    key: 'bits',
    // sorter: true
  }]

  return <Table columns={columns} dataSource={rows} rowKey={record => record.key} pagination={false} size={"small"}/>
}

export {OptimizerView}
