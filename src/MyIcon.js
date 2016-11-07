import React from 'react'
import {Image} from 'react-native'

function MyIcon(props) {
  return <Image
    resizeMode={"contain"}
    style={{width: 30, height: 30}}
    source={require('../images/' + props.imageDir + '/' + props.name + '.png')}
  />
}

export {MyIcon}
