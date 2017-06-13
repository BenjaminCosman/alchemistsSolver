import {potions} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {golemTableInfo, golemClassify} from './Logic.js'
import {mkAntdRows, mkTableCell} from './Misc.js'

import React from 'react'

import _ from 'lodash'

import Table from 'antd/lib/table'


function GolemView(props) {
  const data = mkAntdRows(golemTableInfo(props.worlds), golemClassify)

  let columns = _.slice(_.keys(potions), 0, 6).map((name, index) =>
    ({
      title: <MyIcon imageDir="coloredCircles" name={name}/>,
      dataIndex: index,
      key: name,
      width: 150,
      render: (chance, row) => mkTableCell(chance, row.hedge, v => v > 0)
    })
  )
  // Reorder for display - printed sheet has big blue first
  columns = [columns[4], columns[5], columns[2], columns[3], columns[0], columns[1]]
  columns.unshift({
    title: <div/>,
    dataIndex: "index",
    key: "icon",
    width: 150,
    render: index => <MyIcon imageDir="golemTest" name={['ears', 'chest'][index]} />
  })

  return <div>
    <h2>Golem</h2>
    <Table
      columns={columns}
      dataSource={data}
      rowKey={record => record.index}
      pagination={false}
      size={"small"}
    />
  </div>
}

export {GolemView}
