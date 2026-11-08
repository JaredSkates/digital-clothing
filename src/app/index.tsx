import { useAuth, useUser } from '@clerk/expo'
import { AuthView, UserButton } from '@clerk/expo/native'
import { useState } from 'react'
import {
  ActivityIndicator,
  Button,
  Image,
  Modal,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import SignIn from './api/sign-in/sign-in'

const palette = {
  light: {
    background: '#FFFFFF',
    card: '#F1F5F9',
    foreground: '#0F172A',
    mutedForeground: '#64748B',
  },
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    foreground: '#F8FAFC',
    mutedForeground: '#CBD5E1',
  },
}

export default function MainScreen() {
  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false })
  const { user } = useUser()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const colorScheme = useColorScheme()
  const colors = palette[colorScheme === 'dark' ? 'dark' : 'light']

  if (!isLoaded) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Welcome, To Digital Clothing</Text>
        {isSignedIn && <UserButton />}
      </View>

      {isSignedIn ? (
        <SignIn  user={user} styles={styles} colors={colors}/> ) : (
        <Button title="Sign in" onPress={() => setIsAuthOpen(true)} />
      )}

      <Modal
        animationType="slide"
        visible={isAuthOpen}
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAuthOpen(false)}
      >
        <AuthView onDismiss={() => setIsAuthOpen(false)} />
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    width: 250,
    fontSize: 27,
    fontWeight: 'bold',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  email: {
    fontSize: 14,
  },
})