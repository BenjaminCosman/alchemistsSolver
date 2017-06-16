import {alchemicals, ingredients} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {coreTableInfo, coreTheories} from './Logic.js'
import {toPercentageString, mkAntdRows} from './Misc.js'

import React from 'react'

import Table from 'antd/lib/table'

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

function PublishView(props) {
  let tableInfo = coreTableInfo(props.worlds)
  let theories = coreTheories(tableInfo)[1]
  let data = mkAntdRows(tableInfo, () => theories)

  if (props.expansionReorder) {
    let temp = data[6]
    data[6] = data[7]
    data[7] = temp
  }

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

export {PublishView}
