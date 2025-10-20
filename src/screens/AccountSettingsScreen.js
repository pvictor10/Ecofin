import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
} from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import COLORS from '../theme/colors';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function AccountSettingsScreen({ navigation }) {
  const { user } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);


  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);


  const [deleting, setDeleting] = useState(false);

  async function persistPreferences() {
    try {
      const ref = doc(db, 'users', user.uid);
      await setDoc(
        ref,
        { prefs: { darkMode, notifications } },
        { merge: true }
      );
    } catch (e) {
      console.log('Erro ao salvar prefs', e);
    }
  }

  async function handleToggleDark(v) {
    setDarkMode(v);
    persistPreferences();
  }

  async function handleToggleNoti(v) {
    setNotifications(v);
    persistPreferences();
  }


  async function handleChangePassword() {
    if (!currentPass || !newPass) {
      Alert.alert('Atenção', 'Preencha a senha atual e a nova senha.');
      return;
    }
    if (newPass.length < 6) {
      Alert.alert('Ops', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    try {
      setLoadingPass(true);

      
      const cred = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, cred);

     
      await updatePassword(user, newPass);

      setCurrentPass('');
      setNewPass('');
      Alert.alert('Tudo certo', 'Senha alterada com sucesso!');
    } catch (e) {
      console.log('CHANGE PASSWORD ERROR ->', e);
      const msg =
        e?.code === 'auth/wrong-password'
          ? 'Senha atual incorreta.'
          : e?.code === 'auth/weak-password'
          ? 'A nova senha é muito fraca.'
          : 'Não foi possível alterar a senha.';
      Alert.alert('Erro', msg);
    } finally {
      setLoadingPass(false);
    }
  }

  function confirmDelete() {
    if (Platform.OS === 'web') {
      const ok = window.confirm(
        'Isso apagará sua conta permanentemente. Deseja continuar?'
      );
      if (ok) handleDeleteFlow();
      return;
    }


    Alert.alert(
      'Excluir conta',
      'Isso apagará sua conta permanentemente. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: handleDeleteFlow },
      ]
    );
  }

 
  function promptPassword() {
    return new Promise((resolve) => {
      if (Platform.OS === 'web') {
        const val = window.prompt('Digite sua senha atual para continuar:');
        resolve(val || null);
        return;
      }

    
      if (Alert.prompt) {
        Alert.prompt(
          'Confirmar senha',
          'Digite sua senha atual para continuar.',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
            { text: 'OK', onPress: (txt) => resolve(txt || '') },
          ],
          'secure-text'
        );
      } else {
        
        resolve(null);
      }
    });
  }

 
  async function handleDeleteFlow() {
    try {
      setDeleting(true);

      await deleteAccount(currentPass || undefined);
    } catch (e) {
   
      if (e?.message === 'REAUTH_NEEDED') {
        const pass = await promptPassword();
        if (!pass) {
          setDeleting(false);
          return;
        }
        try {
          await deleteAccount(pass);
        } catch (e2) {
          console.log('DELETE FLOW ERROR ->', e2);
          Alert.alert('Erro', 'Não foi possível excluir a conta.');
        }
      } else {
        console.log('DELETE FLOW ERROR ->', e);
        Alert.alert('Erro', 'Não foi possível excluir a conta.');
      }
    } finally {
      setDeleting(false);
    }
  }


  async function deleteAccount(passArg) {
    try {
     
      const passwordToUse = passArg || currentPass;
      if (!passwordToUse) {
        throw new Error('REAUTH_NEEDED');
      }

      const cred = EmailAuthProvider.credential(user.email, passwordToUse);
      await reauthenticateWithCredential(user, cred);

   
      await deleteUser(user);

      Alert.alert('Conta excluída', 'Sua conta foi removida.');
    } catch (e) {
      
      throw e;
    }
  }

  // ================== UI ==================
  return (
    <View style={styles.container}>
      {/* App bar */}
      <View style={styles.appbar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backWrap}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>Configurações da Conta</Text>
        <View style={{ width: 72 }} />
      </View>

      {/* Preferências */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferências</Text>

        <View style={styles.row}>
          <Text style={styles.rowText}>Modo Escuro</Text>
          <Switch value={darkMode} onValueChange={handleToggleDark} />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Notificações</Text>
          <Switch value={notifications} onValueChange={handleToggleNoti} />
        </View>
      </View>

      {/* Segurança / Alterar senha */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Segurança</Text>

        <Text style={styles.label}>Senha Atual</Text>
        <TextInput
          value={currentPass}
          onChangeText={setCurrentPass}
          placeholder="Insira sua senha atual"
          secureTextEntry
          style={styles.input}
        />

        <Text style={styles.label}>Nova Senha</Text>
        <TextInput
          value={newPass}
          onChangeText={setNewPass}
          placeholder="Insira uma senha nova"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={loadingPass}
          style={[styles.primaryBtn, loadingPass && { opacity: 0.7 }]}
        >
          <Text style={styles.primaryBtnText}>
            {loadingPass ? 'Alterando...' : 'Alterar senha'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Excluir conta */}
      <TouchableOpacity
        onPress={confirmDelete}
        disabled={deleting}
        style={[styles.dangerBtn, deleting && { opacity: 0.7 }]}
      >
        <Text style={styles.dangerBtnText}>
          {deleting ? 'Excluindo...' : 'Excluir Minha Conta'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const P = 18;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F9FC', padding: P },

  appbar: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backWrap: { flexDirection: 'row', alignItems: 'center', width: 72 },
  backArrow: { color: '#111', fontSize: 20, marginRight: 6 },
  backLabel: { color: '#111', fontSize: 14, fontWeight: '700' },
  appbarTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: P,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { color: COLORS.navy, fontWeight: '800', marginBottom: 12 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowText: { color: COLORS.navy, fontWeight: '600' },

  label: { color: COLORS.gray, marginTop: 8, marginBottom: 6 },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.navy,
  },

  primaryBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#000000ff', fontWeight: '800' },

  dangerBtn: {
    marginTop: 10,
    backgroundColor: '#E54B4B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dangerBtnText: { color: '#fff', fontWeight: '800' },
});
