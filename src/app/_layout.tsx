import { AuthProvider } from "@/providers/AuthProviders";
import "../../global.css";
import { Slot} from 'expo-router';


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
        <Slot />
      </AuthProvider>
      //</ThemeProvider>
  );
}