import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import CheckoutScreen from '../screens/main/CheckoutScreen';
import DateTimeScreen from '../screens/main/DateTimeScreen';
import HomeScreen from '../screens/main/HomeScreen';
import PaymentScreen from '../screens/main/PaymentScreen';
import PaymentStatusScreen from '../screens/main/PaymentStatusScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SalonDetailScreen from '../screens/main/SalonDetailScreen';
import SearchLocationScreen from '../screens/main/SearchLocationScreen';
import StylistSelectScreen from '../screens/main/StylistSelectScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="SearchLocation" component={SearchLocationScreen} />
      <HomeStack.Screen name="SalonDetail" component={SalonDetailScreen} />
      <HomeStack.Screen name="StylistSelect" component={StylistSelectScreen} />
      <HomeStack.Screen name="DateTime" component={DateTimeScreen} />
      <HomeStack.Screen name="Checkout" component={CheckoutScreen} />
      <HomeStack.Screen name="Payment" component={PaymentScreen} />
      <HomeStack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
    </HomeStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ headerShown: false, title: 'Home' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
