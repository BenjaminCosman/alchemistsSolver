import React from 'react'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'

class ExpansionSelectorDialog extends React.Component {
  state = {
      open: true,
  }
  useExpansion = () => {
    this.props.callback()
    this.handleClose()
  }
  handleClose = () => this.setState({open: false})
  render() {
    const actions = [
      <FlatButton
        label="YES (BETA - VERY SLOW)"
        onTouchTap={this.useExpansion}
      />,
      <FlatButton
        label="NO"
        primary={true}
        onTouchTap={this.handleClose}
      />,
    ]

    return (
      <Dialog
        open={this.state.open}
        modal={true}
        actions={actions}
        title="Use King's Golem expansion?"
      />
    )
  }
}

export default ExpansionSelectorDialog
