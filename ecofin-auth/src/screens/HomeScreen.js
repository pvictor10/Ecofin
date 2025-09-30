import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const nameOrEmail = user?.displayName || user?.email || 'Usuário';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo 👋</Text>
      <Text style={styles.subtitle}>{nameOrEmail}</Text>

      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: '800', color: '#0F2D52' },
  subtitle: { marginTop: 8, color: '#6B7280' },
  button: {
    marginTop: 20, backgroundColor: '#588DB0', paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: 12, alignItems: 'center', minWidth: 180
  },
  buttonText: { color: '#fff', fontWeight: '700' },
});
