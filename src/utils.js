import _ from 'lodash'

var myCurry = function(func, param) {
  return _.bind(function() {
    func(param)
  }, this)
}

export {myCurry}
