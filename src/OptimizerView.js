import {alchemicals, ingredients, potionsInverted, potions} from './Enums.js'
import {toPercentageString} from './Misc.js'
import {MyIcon} from './MyIcon.js'
import {mixInWorld, coreTableInfo, coreTheories, encyclopediaTheories, partitionWeight} from './Logic.js'

import React from 'react'

import _ from 'lodash'
import {round} from 'mathjs'

import Table from 'antd/lib/table'
import Checkbox from 'antd/lib/checkbox'
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

function OptimizerView({worlds, encyclopedia, golem}) {
  const [filteredInfo, setFilteredInfo] = React.useState({bits:["true"]})
  const [sortedInfo, setSortedInfo] = React.useState({})
  const [animateColumn, setAnimateColumn] = React.useState(false)

  let rows = []
  const [baselineCertainIngredients, baselineHedgeIngredients] = coreTheories(coreTableInfo(worlds))
  let [baselineCertainAspects, baselineHedgeAspects] = [0,0]
  if (encyclopedia) {
    [baselineCertainAspects, baselineHedgeAspects] = encyclopediaTheories(worlds)
  }

  for (let ing1 = 0; ing1 < ingredients.length; ing1++) {
    for (let ing2 = ing1 + 1; ing2 < ingredients.length; ing2++) {
      let newCertainTheories = 0
      let newTotalTheories = 0
      const partitions = partitionWorlds([ing1, ing2], worlds)
      _.forEach(partitions, (partition) => {
        const [certainIngredients, hedgeIngredients] = coreTheories(coreTableInfo(partition))
        let [certainAspects, hedgeAspects] = [0,0]
        if (encyclopedia) {
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

      let animateSuccess = 0
      if (animateColumn) {
        _.forEach(worlds, weightedWorld => {
          const alchemical0 = alchemicals[weightedWorld.ingAlcMap[ing1]]
          const alchemical1 = alchemicals[weightedWorld.ingAlcMap[ing2]]
          const aspects = _.zipWith(alchemical0, alchemical1, (a, b) => (a+b)/2)
          let possible = _.filter(weightedWorld.golemMaps, (golemMap) => {
            const worldAspects = _.map(golemMap, (affect) => {
              if (affect === 'nothing') {
                return 0
              } else {
                return affect.size
              }
            })
            return _.isEqual(aspects, worldAspects)
          })
          animateSuccess += weightedWorld.multiplicity * possible.length
        })
      }

      const denominator = partitionWeight(worlds)
      let row = {
        ingredients:[ing1, ing2],
        bits:entropy(partitions),
        newCertainTheories:newCertainTheories/denominator,
        newTotalTheories:newTotalTheories/denominator,
        mixSuccess:mixSuccess/denominator,
      }
      if (animateColumn) {
        row.animateSuccess = animateSuccess/denominator
      }
      rows.push(row)
    }
  }

  // Manually apply ingredients filter because antd only provides
  // disjunctive filters and we need a conjunctive one.
  if (filteredInfo.ingredients && filteredInfo.ingredients.length > 0) {
    rows = rows.filter(row =>
      _.includes(filteredInfo.ingredients, ""+row.ingredients[0]) &&
      _.includes(filteredInfo.ingredients, ""+row.ingredients[1])
    )
  }

  // TODO Filter doesn't fit in div if table is too small. See
  // https://ant.design/components/table/#components-table-demo-custom-filter-panel
  // for alternatives?
  let columns = [{
    title: 'Ingredients to mix',
    dataIndex: 'ingredients',
    key: 'ingredients',
    render: ings => <>
      <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[0]]}/></div>
      <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[1]]}/></div>
    </>,
    filters: ingredients.map((name, index) => ({text:<MyIcon imageDir="ingredients" name={ingredients[index]}/>, value:index})),
    filteredValue: filteredInfo.ingredients,
    width: 150,
    // fixed: 'left',
  }, {
    title: 'Starred theory chance',
    dataIndex: 'newCertainTheories',
    key: 'newCertainTheories',
    sorter: (a, b) => a.newCertainTheories - b.newCertainTheories,
    sortOrder: sortedInfo.columnKey === 'newCertainTheories' && sortedInfo.order,
    render: toPercentageString,
    width: 150,
  }, {
    title: 'Total theory chance',
    dataIndex: 'newTotalTheories',
    key: 'newTotalTheories',
    sorter: (a, b) => a.newTotalTheories - b.newTotalTheories,
    sortOrder: sortedInfo.columnKey === 'newTotalTheories' && sortedInfo.order,
    render: toPercentageString,
    width: 150,
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
    onFilter: (value, record) => record.bits > 0,
    render: bits => round(bits, 1),
    width: 150,
  }, {
    title: 'Mix Success',
    dataIndex: 'mixSuccess',
    key: 'mixSuccess',
    sorter: (a, b) => a.mixSuccess - b.mixSuccess,
    sortOrder: sortedInfo.columnKey === 'mixSuccess' && sortedInfo.order,
    filters: _.keys(potions).map((name, index) => ({text:<MyIcon imageDir="potions" name={name}/>, value:index})),
    render: toPercentageString,
    width: 150,
  }]

  if (animateColumn) {
    columns.push({
      title: 'Animate Success',
      dataIndex: 'animateSuccess',
      key: 'animateSuccess',
      sorter: (a, b) => a.animateSuccess - b.animateSuccess,
      sortOrder: sortedInfo.columnKey === 'animateSuccess' && sortedInfo.order,
      render: toPercentageString,
      width: 150,
    })
  }

  let golemButtons = []
  if (golem) {
    golemButtons = [
      <Checkbox
        checked={animateColumn}
        onChange={() => setAnimateColumn(!animateColumn)}
        key="button">
      Show "Animate Success" column. (Not recommended - unnecessary and very
        slow - until remaining worlds is at most a few thousand.)
      </Checkbox>
    ]
  }

  return <>
    {golemButtons}
    <Table
      columns={columns}
      dataSource={rows}
      rowKey={record => record.ingredients}
      pagination={false}
      sortDirections={['descend', 'ascend']}
      size="small"
      onChange={(pagination, filters, sorter) => {
        setFilteredInfo(filters || {})
        setSortedInfo(sorter || {})
      }}
      scroll={{ y: 300 }}
    />
    Scroll on table to see more results.
  </>
}

export {OptimizerView}
