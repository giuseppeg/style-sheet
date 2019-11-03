import { StyleSheet } from 'style-sheet'

const styles1 = StyleSheet.create({
  root: {
    color: 'red',
    marginLeft: 10,
    '&:hover': {
      paddingRight: 5
    }
  }
})
