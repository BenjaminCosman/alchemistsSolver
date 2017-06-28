import {potions} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {golemTableInfo, golemClassify} from './Logic.js'
import {mkAntdRows, mkTableCell} from './Misc.js'

import React from 'react'

import _ from 'lodash'

import Table from 'antd/lib/table'


function GolemView(props) {
  const data = mkAntdRows(golemTableInfo(props.worlds), golemClassify)

  let cols = _.slice(_.keys(potions), 0, 6).map((name, index) =>
    ({
      title: <MyIcon imageDir="coloredCircles" name={name}/>,
      dataIndex: index,
      key: name,
      width: 150,
      render: (chance, row) => mkTableCell(chance, row.hedge, v => v > 0)
    })
  )
  // Reorder for display - printed sheet has big blue first
  cols = [cols[4], cols[5], cols[2], cols[3], cols[0], cols[1]]
  cols.unshift({
    title: <div/>,
    dataIndex: "index",
    key: "icon",
    width: 150,
    render: index => <MyIcon imageDir="golemTest" name={['ears', 'chest'][index]} />
  })

  return <div>
    <h2>Golem</h2>
    <Table
      columns={cols}
      dataSource={data}
      rowKey={record => record.index}
      pagination={false}
      size="small"
    />
  </div>
}

export {GolemView}
