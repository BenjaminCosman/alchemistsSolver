import {alchemicals, ingredients} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {coreTableInfo, coreTheories} from './Logic.js'
import {toPercentageString} from './Misc.js'

import React from 'react'

import _ from 'lodash'

import Table from 'antd/lib/table'
import Button from 'antd/lib/button'

function display(cellInfo, hedges, ingredient) {
  let extra = <div/>
  const color = hedges[ingredient]
  if (cellInfo === 1) {
    extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gold"/></div>
  } else if (cellInfo > 0) {
    if (color !== undefined) {
      extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name={color}/></div>
    }
  }

  return <div>{toPercentageString(cellInfo)}{extra}</div>
}

function countWorlds(worlds) {
  return _.sumBy(worlds, (world) => world.golemMaps.length)
}

class PublishView extends React.Component {
  state = {
    summary: true,
    currentWorld: 0
  }

  componentWillReceiveProps(nextProps) {
    // reset to Summary mode if worlds changes (as hopefully indicated by countWorlds)
    if (countWorlds(this.props.worlds) !== countWorlds(nextProps.worlds)) {
      this.setState({summary: true, currentWorld: 0})
    }
  }

  render() {
    let worlds = this.props.worlds
    let worldTracker
    if (this.state.summary) {
      worldTracker = <div>
        Remaining worlds: {countWorlds(worlds)}
        <Button size="small" onClick={() => this.setState({summary: false})}>Explore</Button>
      </div>
    } else {
      const total = countWorlds(worlds)
      // TODO Broken for golem expansion because +/- advances one full world object, which is actually several golem worlds
      // Also, should affect other publish views too (e.g. EncyclopediaView)?
      worldTracker = <div>
        {"World " + (1+this.state.currentWorld) + " of " + total}
        <Button size="small" onClick={() => this.setState({summary: true})}>Summary</Button>
        <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld - 1 + total) % total})}>-</Button>
        <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld + 1) % total})}>+</Button>
      </div>
      worlds = [this.props.worlds[this.state.currentWorld]]
    }

    let tableInfo = coreTableInfo(worlds)
    let theories = coreTheories(tableInfo)[1]
    // console.log(theories)
    const data = _.map(tableInfo, (row, index) => {
      let v = _.toPlainObject(row)
      v.index = index
      v.hedge = theories
      return v
    })

    let columns = ingredients.map((name, index) =>
      ({
        title: <MyIcon imageDir="ingredients" name={name}/>,
        dataIndex: index,
        key: name,
        width: 150,
        render: (chance, row) => display(chance, row.hedge, index)
      })
    )
    columns.unshift({
      title: <div/>,
      dataIndex: "index",
      key: "icon",
      width: 150,
      render: index => <MyIcon imageDir="alchemicals" name={alchemicals[index].join("")} />
    })

    return (
      <div>
        {worldTracker}
        <Table
          columns={columns}
          dataSource={data}
          rowKey={record => record.index}
          pagination={false}
          size={"small"}
        />
      </div>
    )
  }
}

export {PublishView}
