import { StyleSheet } from 'style-sheet'
import { TEST } from './constants'

const backgroundColor = 'hotpink'
const marginTop = 10;
const rule = {
  display: 'block'
}
const small = true

const styles1 = StyleSheet.create({
  root: {
    color: 'red',
    marginTop: marginTop + 'px',
    paddingTop: marginTop / 2 + 'px',
    fontSize: (small ? marginTop : 4) + 'px',
    val: TEST,
    backgroundColor,
    filter: 'blur(10px)'
  },
  foo: rule,
  notExtractable: props.foo
})

const styles2 = StyleSheet.create({
  root: {
    display: 'flex'
  },
})
