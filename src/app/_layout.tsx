import { AuthProvider } from "@/providers/AuthProvider";
import "../../global.css";
import { Slot} from 'expo-router';
import { GroupProvider } from "@/providers/GroupProvider";


//import { ThemeProvider, DarkTheme} from '@react-navigation/native';

/*const myTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary:'orange',
        card: '#101010',
    },
};*/

export default function RootLayout() {
  return (
      //<ThemeProvider value={myTheme}>
      <AuthProvider>
        <GroupProvider>
          <Slot />
        </GroupProvider>
      </AuthProvider>
  );
}