import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import { useAuth } from '../context/AuthContext';
import ProfileScreen from '../screens/ProfileScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SupportScreen from '../screens/SupportScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';


const Stack = createNativeStackNavigator();

function Center() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}


class Boundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error('Render error:', err, info); }
  render() {
    if (this.state.err) {
      return (
        <View style={{ flex:1, padding:16, alignItems:'center', justifyContent:'center' }}>
          <Text style={{ fontSize:18, marginBottom:8 }}>Falha ao renderizar</Text>
          <Text>{String(this.state.err?.message || this.state.err)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Payments" component={PaymentMethodsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, initializing } = useAuth();
  if (initializing) return <Center />;
  return user ? (
    <Boundary>
      <MainStack />
    </Boundary>
  ) : (
    <AuthStack />
  );
}
