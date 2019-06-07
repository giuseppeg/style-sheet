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
    marginTop: marginTop,
    marginBottom: marginTop + 'px',
    paddingTop: marginTop / 2,
    fontSize: (small ? marginTop : 4),
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

const ComponentStatic = () => <div css={{ color: 'red' }} />
const ComponentStaticArray = () => <div css={[{ color: 'red' }, { marginTop }]} />
const ComponentConstant = () => <div css={{ marginTop }} />
const ComponentConstantImported = () => <div css={{ marginTop: TEST }} />
const ComponentDynamic = ({ margin }) => <div css={{ color: 'red', margin }} />
const ComponentDynamicArray = ({ margin, padding }) => <div css={[{ margin }, { color: 'red', padding }]} />
const ComponentMixedStaticDynamicArray = ({ margin }) => <div css={[{ margin }, { color: 'red' }]} />
