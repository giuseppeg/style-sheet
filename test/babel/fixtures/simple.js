import { StyleSheet } from 'style-sheet'
import { TEST } from './constants'

const marginTop = 10;
const rule = {
  display: 'block'
}
const small = true

const styles1 = StyleSheet.create({
  root: {
    color: 'red',
    marginTop,
    paddingTop: marginTop / 2,
    fontSize: small ? marginTop : 4,
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
