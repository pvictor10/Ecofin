import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import LabeledInput from '../components/LabeledInput';
import PrimaryButton from '../components/PrimaryButton';
import InlineText from '../components/InlineText';
import EyeToggle from '../components/EyeToggle';
import COLORS from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valid = user.trim().length > 0 && password.length >= 6;

  const onLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signIn(user.trim(), password);
    } catch (e) {
      setError('Não foi possível entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1400&auto=format&fit=crop',
          }}
          style={styles.banner}
          resizeMode="cover"
        />

        <View style={styles.container}>
          <Text style={styles.title}>Entre na sua conta</Text>

          <LabeledInput
            label="*Usuário:"
            placeholder="Seu usuário ou seu e-mail"
            value={user}
            onChangeText={setUser}
            returnKeyType="next"
          />

          <View style={{ height: 12 }} />

          <LabeledInput
            label="*Senha:"
            placeholder="Insira sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            rightElement={
              <EyeToggle visible={showPass} onPress={() => setShowPass(v => !v)} />
            }
            returnKeyType="done"
          />

          <View style={{ height: 20 }} />

          <PrimaryButton
            title={loading ? 'Entrando...' : 'Entrar'}
            disabled={!valid || loading}
            onPress={onLogin}
          />

          {error ? (
            <Text style={{ color: 'tomato', marginTop: 8 }}>{error}</Text>
          ) : null}

          <View style={{ height: 16 }} />

          <InlineText
            prefix="Não possui uma conta? "
            action="Cadastre-se"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  banner: { width: '100%', height: 180 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.navy, marginTop: 16 },
});
