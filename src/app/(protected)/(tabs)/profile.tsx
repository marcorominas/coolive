import { Text, View} from 'react-native';
//import {supabase} from '@/lib/supabase';


export default function ProfileScreen(){
    return (
        <View className="flex-1 bg-gray-100">
            <Text className="text-3xl font-bold text-center">Profile</Text>
            <Text className="text-lg text-center">This is the profile screen.</Text>
            <Text 
                //onPress={() => supabase.auth.signOut{}} 
                className="text-lg text-center"
                >
                    Sign Out
            </Text>
        </View>
    );  

}