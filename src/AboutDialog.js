import React from 'react'
import Modal from 'antd/lib/modal'

function showAboutDialog() {
  Modal.info({
    title: 'Alchemists Solver',
    content: (
      <div>
        {/* TODO: Change to Matúš */}
        A helper app for <a href="http://czechgames.com/en/alchemists/">Alchemists</a>,
        Matus Kotry's board game of logic, worker placement, and academic pride.
        All images belong to the game publishers.
        <br/>
        <br/>
        by Rafael and Benjamin Cosman
      </div>
    ),
  })
}

export {showAboutDialog}
