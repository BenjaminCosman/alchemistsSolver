import Modal from 'antd/lib/modal'

function showExpansionDialog(yesCallback) {
  Modal.confirm({
    title: "Use King's Golem expansion?",
    okText: 'No',
    cancelText: 'Yes (Beta)',
    onCancel: yesCallback
  })
}

export {showExpansionDialog}
