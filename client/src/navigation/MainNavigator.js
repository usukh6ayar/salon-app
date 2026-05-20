import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import BookingsScreen from '../screens/main/BookingsScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import DateTimeScreen from '../screens/main/DateTimeScreen';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import HomeScreen from '../screens/main/HomeScreen';
import PaymentScreen from '../screens/main/PaymentScreen';
import PaymentStatusScreen from '../screens/main/PaymentStatusScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ReceiptScreen from '../screens/main/ReceiptScreen';
import SalonDetailScreen from '../screens/main/SalonDetailScreen';
import SearchLocationScreen from '../screens/main/SearchLocationScreen';
import StylistSelectScreen from '../screens/main/StylistSelectScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="SearchLocation" component={SearchLocationScreen} />
      <HomeStack.Screen name="SalonDetail" component={SalonDetailScreen} />
      <HomeStack.Screen name="StylistSelect" component={StylistSelectScreen} />
      <HomeStack.Screen name="DateTime" component={DateTimeScreen} />
      <HomeStack.Screen name="Checkout" component={CheckoutScreen} />
      <HomeStack.Screen name="Payment" component={PaymentScreen} />
      <HomeStack.Screen name="Receipt" component={ReceiptScreen} />
      <HomeStack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
    </HomeStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2B61F5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: 'Нүүр',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          title: 'Захиалга',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Дуртай',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профайл',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
