import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import HeaderBar from '../components/HeaderBar';

// Serviços do Firestore
import {
  subscribeUserTransactions,
  subscribeUserBudget,
  saveUserBudget,
} from '../services/firestore';

const COLORS = {
  primary: '#588DB0',
  text: '#0F2D52',
  sub: '#6B7280',
  bg: '#F5F7FB',
  card: '#FFFFFF',
  red: '#DC2626',
  green: '#16A34A',
  border: '#E5E7EB',
  alertBg: '#FDECEC',
  alertBorder: '#F8B4B4',
};

function formatBRL(value = 0) {
  try {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch {
    return `R$ ${Number(value || 0).toFixed(2)}`;
  }
}

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const nameOrEmail = user?.displayName || user?.email || 'Usuário';

  // Estado dos dados
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(null); // { limit: number }

  // Subscriptions (tempo real)
  useEffect(() => {
    const unsubTx = subscribeUserTransactions(setTransactions);
    const unsubBudget = subscribeUserBudget(setBudget);
    return () => {
      unsubTx && unsubTx();
      unsubBudget && unsubBudget();
    };
  }, []);

  // Cálculos
  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      const amt = Number(t.amount || 0);
      if ((t.type || '').toLowerCase() === 'income') income += amt;
      else expense += amt;
    });
    return { totalIncome: income, totalExpense: expense };
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  const budgetLimit = Number(budget?.limit || 0);
  const budgetUsedPct = useMemo(() => {
    if (!budgetLimit) return 0;
    return Math.min(100, (totalExpense / budgetLimit) * 100);
  }, [totalExpense, budgetLimit]);

  const showBudgetAlert =
    budgetLimit > 0 && totalExpense > budgetLimit; // só mostra se ultrapassar

  const handleOpenBudget = async () => {
    // Prompt simples no Web; no mobile depois podemos trocar por modal nativo
    let value = null;
    if (Platform.OS === 'web') {
      value = window.prompt('Defina seu orçamento mensal (R$):', String(budgetLimit || ''));
    }
    if (value !== null && value !== '') {
      await saveUserBudget(Number(value));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* HEADER COM MENU (hambúrguer) */}
      <HeaderBar
        userName={nameOrEmail}
        onSignOut={signOut}
        onOpenBudget={handleOpenBudget}
        onGoProfile={() => navigation.navigate('Profile')}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Card: Saldo Total */}
        <View style={styles.card}>
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.cardTitle}>Saldo Total</Text>
            <Text style={styles.balanceValue}>{formatBRL(balance)}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.muted}>Receitas: {formatBRL(totalIncome)}</Text>
            <Text style={styles.muted}>Despesas: {formatBRL(totalExpense)}</Text>
          </View>
        </View>

        {/* Card: Orçamento Mensal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Orçamento Mensal</Text>
          <Text style={[styles.muted, { marginTop: 6 }]}>
            {formatBRL(totalExpense)} de {formatBRL(budgetLimit)}{' '}
            <Text style={{ fontWeight: '700' }}>
              {budgetLimit ? `${budgetUsedPct.toFixed(1)}%` : '0.0%'}
            </Text>
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${budgetUsedPct}%` },
              ]}
            />
          </View>
        </View>

        {/* Alerta (só se ultrapassar o orçamento) */}
        {showBudgetAlert && (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Alerta de Gasto Excessivos</Text>
            <Text style={styles.alertText}>
              Você gastou {formatBRL(totalExpense)} no mês, acima do limite de{' '}
              {formatBRL(budgetLimit)}. Considere rever suas despesas.
            </Text>
          </View>
        )}

        {/* Botões de atalho (placeholders) */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <Pressable style={styles.pillBtn}>
            <Text style={styles.pillBtnText}>Relatórios</Text>
          </Pressable>
          <Pressable style={styles.pillBtn}>
            <Text style={styles.pillBtnText}>Orçamentos</Text>
          </Pressable>
        </View>

        {/* Lista de Transações */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Transações Recentes</Text>

          {transactions.length === 0 ? (
            <Text style={[styles.muted, { marginTop: 8 }]}>
              Sem transações ainda.
            </Text>
          ) : (
            transactions.map((t) => {
              const isIncome = (t.type || '').toLowerCase() === 'income';
              const sign = isIncome ? '+' : '−';
              const color = isIncome ? COLORS.green : COLORS.red;

              return (
                <View key={t.id} style={styles.txRow}>
                  <View>
                    <Text style={styles.txTitle}>
                      {t.title || t.note || 'Transação'}
                    </Text>
                    <Text style={styles.txCategory}>
                      {t.category || (isIncome ? 'Receitas' : 'Despesas')}
                    </Text>
                  </View>

                  <Text style={[styles.txAmount, { color }]}>
                    {sign} {formatBRL(t.amount)}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  balanceValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  muted: {
    color: COLORS.sub,
    fontSize: 12,
  },
  progressTrack: {
    marginTop: 10,
    height: 8,
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#E9EEF3',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  alertBox: {
    backgroundColor: COLORS.alertBg,
    borderColor: COLORS.alertBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  alertTitle: {
    color: COLORS.red,
    fontWeight: '800',
    marginBottom: 6,
  },
  alertText: {
    color: COLORS.sub,
  },
  pillBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pillBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  sectionTitle: {
    color: COLORS.text,
    fontWeight: '800',
    marginBottom: 10,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  txTitle: {
    color: COLORS.text,
    fontWeight: '700',
  },
  txCategory: {
    color: COLORS.sub,
    marginTop: 2,
  },
  txAmount: {
    fontWeight: '700',
  },
});
