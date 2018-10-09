import { TEST } from './constants.js'
import { StyleSheet } from '../../../dist/dev'

const margin = 10;
const rule = {
  display: 'block'
}
const small = true

StyleSheet.create({
  root: {
    color: 'red',
    margin,
    padding: margin / 2,
    fontSize: small ? margin : 4,
    val: TEST
  },
  foo: rule,
})
