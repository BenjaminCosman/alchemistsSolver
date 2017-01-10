import {ingredients, potionsInverted} from './Enums.js'
import {mixInWorld} from './Logic.js'
import {MyIcon} from './MyIcon.js'

import React from 'react'

import _ from 'lodash'
import math from 'mathjs'

import {Table} from 'antd'
import 'antd/dist/antd.css'


// The expected number of bits of information from real science is
// -[1/7*lg(1/7) * 7]
// = 2.807 bits

// The expected number of bits of information from experimenting randomly on an adventurer is
// -[1/7*lg(1/7) + 2/7*lg(2/7) + 1/7*lg(1/7) + 3/7*lg(3/7)]
// = 1.842 bits

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

class OptimizerView extends React.Component {
  state = {
    filteredInfo: null,
    sortedInfo: null,
  }

  handleChange = (pagination, filters, sorter) => {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  }

  render() {
    var rows = []
    var key = 0
    _.forEach(_.keys(ingredients), (ingredient1) => {
      _.forEach(_.keys(ingredients), (ingredient2) => {
        if (ingredient1 < ingredient2) {
          var bits = entropy(partitionWorlds([ingredient1, ingredient2], this.props.worlds))
          rows.push({ingredients:[ingredient1, ingredient2], bits:math.round(bits, 1), key:key})
          key++
        }
      })
    })

    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};

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
      sorter: (a, b) => a.bits - b.bits,
      sortOrder: sortedInfo.columnKey === 'bits' && sortedInfo.order,
    }]

    return <Table
      columns={columns}
      dataSource={rows}
      rowKey={record => record.key}
      pagination={false}
      size={"small"}
      onChange={this.handleChange}/>
  }
}

export {OptimizerView}
