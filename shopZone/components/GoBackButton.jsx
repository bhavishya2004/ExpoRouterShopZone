import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { ChevronLeft } from 'lucide-react-native'
import { useRouter } from 'expo-router'

const GoBackButton = () => {
    const router = useRouter()

    const handleGoBack = () => {
      if (Platform.OS === 'web') {
        window.history.back();
      } else {
        router.back();
      }
    };
  return (
    <TouchableOpacity onPress={handleGoBack} style={styles.GoBack}>
      <ChevronLeft size={25} color={"black"}/>
    </TouchableOpacity>
  )
}

export default GoBackButton

const styles = StyleSheet.create({
  GoBack: {
    padding: 5,
    borderRadius:30,
    backgroundColor:"#F2F2F2",
    ...Platform.OS === "web" && {
      marginLeft: 20,
    }
  },
})