import { TEST } from './constants.js'
import { StyleSheet } from 'style-sheet'

const margin = 10;
const rule = {
  display: 'block'
}
const small = true

const styles1 = StyleSheet.create({
  root: {
    color: 'red',
    margin,
    padding: margin / 2,
    fontSize: small ? margin : 4,
    val: TEST
  },
  foo: rule,
  notExtractable: props.foo
})

const styles2 = StyleSheet.create({
  root: {
    display: 'flex'
  },
})
