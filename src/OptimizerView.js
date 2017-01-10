import {ingredients, potionsInverted} from './Enums.js'
import {mixInWorld} from './Logic.js'
import {MyIcon} from './MyIcon.js'
import {tableInfo, theories} from './PublishView.js'

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
    filteredInfo: {bits:["true"]},
    sortedInfo: null,
  }

  handleChange = (pagination, filters, sorter) => {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  }

  render() {
    let rows = []
    let key = 0
    let baselineData = tableInfo(this.props.worlds)
    let [baselineCertainIngredients, baselineHedgeIngredients] = theories(baselineData)

    _.forEach(_.keys(ingredients), (ingredient1) => {
      _.forEach(_.keys(ingredients), (ingredient2) => {
        if (ingredient1 < ingredient2) {
          let newCertainTheories = 0
          let newTotalTheories = 0
          let partitions = partitionWorlds([ingredient1, ingredient2], this.props.worlds)
          _.forEach(partitions, (partition) => {
            let data = tableInfo(partition)
            let [certainIngredients, hedgeIngredients] = theories(data)
            if (certainIngredients.length > baselineCertainIngredients.length) {
              newCertainTheories += partition.length
            }
            if (certainIngredients.length + _.size(hedgeIngredients) > baselineCertainIngredients.length + _.size(baselineHedgeIngredients)) {
              newTotalTheories += partition.length
            }
          })

          let bits = entropy(partitions)

          rows.push({
            ingredients:[ingredient1, ingredient2],
            bits:math.round(bits, 1),
            newCertainTheories:newCertainTheories/this.props.worlds.length,
            newTotalTheories:newTotalTheories/this.props.worlds.length,
            key:key
          })
          key++
        }
      })
    })

    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};

    const columns = [{
      title: 'Ingredients to mix',
      dataIndex: 'ingredients',
      key: 'ingredients',
      render: ings => <div>
        <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[0]]}/></div>
        <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[1]]}/></div>
      </div>
    }, {
      title: 'Starred theory chance',
      dataIndex: 'newCertainTheories',
      key: 'newCertainTheories',
      sorter: (a, b) => a.newCertainTheories - b.newCertainTheories,
      sortOrder: sortedInfo.columnKey === 'newCertainTheories' && sortedInfo.order,
      render: chance => math.round(chance*100, 0)
    }, {
      title: 'Total theory chance',
      dataIndex: 'newTotalTheories',
      key: 'newTotalTheories',
      sorter: (a, b) => a.newTotalTheories - b.newTotalTheories,
      sortOrder: sortedInfo.columnKey === 'newTotalTheories' && sortedInfo.order,
      render: chance => math.round(chance*100, 0)
    }, {
      title: 'Shannon entropy',
      dataIndex: 'bits',
      key: 'bits',
      sorter: (a, b) => a.bits - b.bits,
      sortOrder: sortedInfo.columnKey === 'bits' && sortedInfo.order,
      filters: [
        { text: 'Remove known results', value: true },
      ],
      filteredValue: filteredInfo.bits,
      onFilter: (value, record) => value === false || record.bits > 0,
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
