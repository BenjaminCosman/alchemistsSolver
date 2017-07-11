import {potions, alchemicals} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {encyclopediaTableInfo, encyclopediaClassify} from './Logic.js'
import {mkAntdRows, mkTableCell} from './Misc.js'

import React from 'react'

import _ from 'lodash'

import Table from 'antd/lib/table'


function EncyclopediaView({worlds}) {
  const data = mkAntdRows(encyclopediaTableInfo(worlds), encyclopediaClassify)

  let columns = _.keys(alchemicals).map((name, index) =>
    ({
      title: index,
      dataIndex: index,
      key: name,
      width: 150,
      render: (chance, row) => mkTableCell(chance, row.hedge, v => v === 0 || v === 1)
    })
  )
  columns.unshift({
    title: <div/>,
    dataIndex: "index",
    key: "icon",
    width: 150,
    render: index => <MyIcon imageDir="aspects" name={_.keys(potions)[index*2]} />
  })

  return <div>
    <h2>Encyclopedia</h2>
    <Table
      columns={columns}
      dataSource={data}
      rowKey={record => record.index}
      pagination={false}
      size="small"
      showHeader={false}
    />
  </div>
}

export {EncyclopediaView}
