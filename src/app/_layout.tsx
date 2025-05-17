import { Slot, Stack} from 'expo-router';

import { ThemeProvider, DarkTheme} from '@react-navigation/native';

const myTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary:'orange',
    },
};

export default function RootLayout() {
    return (
        <ThemeProvider  value={myTheme}>
            <Slot />;
        
        </ThemeProvider>
    );
}