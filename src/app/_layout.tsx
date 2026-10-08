import Colors from "@/constants/Colors";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

DarkTheme.colors.primary = Colors.dark.tint;
DarkTheme.colors.background = Colors.dark.background;
DarkTheme.colors.text = Colors.dark.text;

DefaultTheme.colors.primary = Colors.light.tint;
DefaultTheme.colors.background = Colors.light.background;
DefaultTheme.colors.text = Colors.light.text;

export default function RootLayout() {

  const colorScheme = useColorScheme();


  // "colors": {
  //   "primary": "rgb(10, 132, 255)",
  //   "background": "rgb(1, 1, 1)",
  //   "card": "rgb(18, 18, 18)",
  //   "text": "rgb(229, 229, 231)",
  //   "border": "rgb(39, 39, 41)",
  //   "notification": "rgb(255, 69, 58)"
  // }

  // console.log('IOS Dark', JSON.stringify(Dark, null, 2));

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
    </ThemeProvider>
  )
}
