import {ingredients, potionsInverted, potions} from './Enums.js'
import {mixInWorld} from './Logic.js'
import {MyIcon} from './MyIcon.js'
import {coreTableInfo, coreTheories, encyclopediaTheories, partitionWeight} from './Logic.js'

import React from 'react'

import _ from 'lodash'
import math from 'mathjs'

import Table from 'antd/lib/table'
import 'antd/dist/antd.css'


// The expected number of bits of information from real science is
// -[1/7*lg(1/7) * 7]
// = 2.807 bits

// The expected number of bits of information from experimenting randomly on an adventurer is
// -[1/7*lg(1/7) + 2/7*lg(2/7) + 1/7*lg(1/7) + 3/7*lg(3/7)]
// = 1.842 bits

function entropy(partitionedWorlds) {
  const counts = _.map(partitionedWorlds, partitionWeight)
  const denominator = _.sum(counts)
  return _.sumBy(counts, (count) => {
    const p = count/denominator
    if (p === 0) {
      return 0
    }
    return -p * Math.log2(p)
  })
}

function partitionWorlds(ingredients, worlds) {
  let partitionedWorlds = [[],[],[],[],[],[],[]]
  _.forEach(worlds, (world) => {
    const potion = mixInWorld(world, ingredients)
    const partition = potionsInverted[potion]
    partitionedWorlds[partition].push(world)
  })
  return partitionedWorlds
}

class OptimizerView extends React.Component {
  state = {
    filteredInfo: {
      bits:["true"],
      ingredients: [],
      mixSuccess: [],
    },
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
    const [baselineCertainIngredients, baselineHedgeIngredients] = coreTheories(coreTableInfo(this.props.worlds))
    let [baselineCertainAspects, baselineHedgeAspects] = [0,0]
    if (this.props.encyclopedia) {
      [baselineCertainAspects, baselineHedgeAspects] = encyclopediaTheories(this.props.worlds)
    }

    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};

    _.forEach(_.keys(ingredients), (ingredient1) => {
      _.forEach(_.keys(ingredients), (ingredient2) => {
        if (ingredient1 < ingredient2) {
          let newCertainTheories = 0
          let newTotalTheories = 0
          const partitions = partitionWorlds([ingredient1, ingredient2], this.props.worlds)
          _.forEach(partitions, (partition) => {
            const [certainIngredients, hedgeIngredients] = coreTheories(coreTableInfo(partition))
            let [certainAspects, hedgeAspects] = [0,0]
            if (this.props.encyclopedia) {
              [certainAspects, hedgeAspects] = encyclopediaTheories(partition)
            }
            if (certainIngredients.length + certainAspects > baselineCertainIngredients.length + baselineCertainAspects) {
              newCertainTheories += partitionWeight(partition)
            }
            if (certainIngredients.length + _.size(hedgeIngredients) + certainAspects + hedgeAspects
              > baselineCertainIngredients.length + _.size(baselineHedgeIngredients) + baselineCertainAspects + baselineHedgeAspects) {
              newTotalTheories += partitionWeight(partition)
            }
          })

          let mixSuccess = 0
          _.forEach(filteredInfo.mixSuccess, potion => mixSuccess += partitionWeight(partitions[potion]))

          const denominator = partitionWeight(this.props.worlds)
          rows.push({
            ingredients:[ingredient1, ingredient2],
            bits:entropy(partitions),
            newCertainTheories:newCertainTheories/denominator,
            newTotalTheories:newTotalTheories/denominator,
            mixSuccess:mixSuccess/denominator,
          })
        }
      })
    })

    // Manually apply ingredients filter because antd only provides
    // disjunctive filters and we need a conjunctive one.
    if (filteredInfo.ingredients.length > 0) {
      rows = rows.filter(row =>
        _.includes(filteredInfo.ingredients, ""+row.ingredients[0]) &&
        _.includes(filteredInfo.ingredients, ""+row.ingredients[1])
      )
    }

    // TODO Filter doesn't fit in div if table is too small. See
    // https://ant.design/components/table/#components-table-demo-custom-filter-panel
    // for alternatives?
    const columns = [{
      title: 'Ingredients to mix',
      dataIndex: 'ingredients',
      render: ings => <div>
        <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[0]]}/></div>
        <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[1]]}/></div>
      </div>,
      filters: ingredients.map((name, index) => ({text:<MyIcon imageDir="ingredients" name={ingredients[index]}/>, value:index})),
      filteredValue: filteredInfo.ingredients,
      width: 150,
      // fixed: 'left',
    }, {
      title: 'Starred theory chance',
      dataIndex: 'newCertainTheories',
      sorter: (a, b) => a.newCertainTheories - b.newCertainTheories,
      sortOrder: sortedInfo.columnKey === 'newCertainTheories' && sortedInfo.order,
      render: chance => math.round(chance*100, 0),
      width: 150,
    }, {
      title: 'Total theory chance',
      dataIndex: 'newTotalTheories',
      sorter: (a, b) => a.newTotalTheories - b.newTotalTheories,
      sortOrder: sortedInfo.columnKey === 'newTotalTheories' && sortedInfo.order,
      render: chance => math.round(chance*100, 0),
      width: 150,
    }, {
      title: 'Shannon entropy',
      dataIndex: 'bits',
      sorter: (a, b) => a.bits - b.bits,
      sortOrder: sortedInfo.columnKey === 'bits' && sortedInfo.order,
      filters: [
        { text: 'Remove known results', value: true },
      ],
      filteredValue: filteredInfo.bits,
      onFilter: (value, record) => record.bits > 0,
      render: bits => math.round(bits, 1),
      width: 150,
    }, {
      title: 'Mix Success',
      dataIndex: 'mixSuccess',
      sorter: (a, b) => a.mixSuccess - b.mixSuccess,
      sortOrder: sortedInfo.columnKey === 'mixSuccess' && sortedInfo.order,
      filters: _.keys(potions).map((name, index) => ({text:<MyIcon imageDir="potions" name={name}/>, value:index})),
      render: chance => math.round(chance*100, 0),
      width: 150,
    }]

    return <div>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey={record => record.ingredients}
        pagination={false}
        size="small"
        onChange={this.handleChange}
        scroll={{ y: 300 }}
      />
      Scroll on table to see more results.
    </div>
  }
}

export {OptimizerView}
