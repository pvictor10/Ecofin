// src/screens/SupportScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import COLORS from '../theme/colors';

export default function SupportScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* App bar simples */}
      <View style={styles.appbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>Ajuda e Suporte</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Como podemos ajudar?</Text>
          <TextInput
            placeholder="Pesquisar ajuda"
            style={styles.input}
          />
        </View>

      
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Perguntas Frequentes</Text>
          <Text style={styles.row}>• Como adicionar uma nova transação?</Text>
          <Text style={styles.row}>• Como criar um orçamento mensal?</Text>
          <Text style={styles.row}>• Como exportar meus dados financeiros?</Text>
          <Text style={styles.row}>• Como configurar metas financeiras?</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F9FC' },
  appbar: {
    height: 54, backgroundColor: COLORS.primary, borderRadius: 10,
    margin: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center'
  },
  back: { color: '#000000ff', fontSize: 20, marginRight: 8 },
  appbarTitle: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  cardTitle: { color: COLORS.navy, fontWeight: '800', marginBottom: 10 },
  input: { backgroundColor: '#EEF2F6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  row: { color: COLORS.navy, marginBottom: 6 },
});
