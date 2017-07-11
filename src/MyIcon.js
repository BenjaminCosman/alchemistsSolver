import React from 'react'
import {Image} from 'react-native'
import {createStyles, minWidth} from 'react-native-media-queries';

const base = {
  icon: {
    width: 18,
    height: 18,
  }
}

const bigger = {
  icon: {
    width: 30,
    height: 30,
  }
}

// let styleList = [base]
// let size = 18
// for (let i = 450; i < 600; i += 100) {
//   size += 12
//   styleList.push(minWidth(i, {
//     icon: {
//       width: size,
//       height: size,
//     }
//   }))
// }
//
// const styles = createStyles(
//   ...styleList
// );

const styles = createStyles(
  base,
  minWidth(450, bigger),
)

function MyIcon({imageDir, name}) {
  return <Image
    resizeMode="contain"
    style={styles.icon}
    source={require('../images/' + imageDir + '/' + name + '.png')}
  />
}

export {MyIcon, styles}
