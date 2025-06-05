
import { Tabs } from 'expo-router';
import {FontAwesome5} from '@expo/vector-icons';


export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ 
            tabBarShowLabel: false,
            // colors dels icons
            tabBarActiveTintColor: 'orange',   // color tab actiu
            tabBarInactiveTintColor: 'gray',   // color tabs inactius

            // estil de fons de la barra
            tabBarStyle: {
            backgroundColor: '#fff',
            }
        }}>
            <Tabs.Screen 
                name='index' 
                options={{ 
                    title: 'Tasks', 
                    tabBarIcon: ({size, color}) => (
                        <FontAwesome5 name="home" size={size} color={color}/>
                    ),
                }} 
            />
            
            <Tabs.Screen 
                name='taskscalendar' 
                options={{ 
                    title: 'Calendar',
                    tabBarIcon: ({size, color}) => (
                        <FontAwesome5 name="tasks" size={size} color={color}/>
                    ),
                }} 
            />
            <Tabs.Screen 
                name='podium' 
                options={{ 
                    title: 'Podium', 
                    tabBarIcon: ({size, color}) => (
                        <FontAwesome5 name="medal" size={size} color={color}/>
                    ),
                }} 
            />
            <Tabs.Screen 
                name='profile' 
                options={{ 
                    title: 'Profile',
                    tabBarIcon: ({size, color}) => (
                    <FontAwesome5 name="user" size={size} color={color}/>
                    ),
                }} 
            />
        </Tabs> 
    );
}