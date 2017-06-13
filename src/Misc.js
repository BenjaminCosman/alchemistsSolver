
function toPercentageString(v) {
  let percentage = Math.round(v * 100, 0)
  if (percentage === 0 && v !== 0) {
    percentage = "<1"
  } else if (percentage === 100 && v !== 1) {
    percentage = ">99"
  }
  return ""+percentage
}

export {toPercentageString}
