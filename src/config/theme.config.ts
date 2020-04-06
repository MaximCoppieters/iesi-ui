import { ThemeOptions } from '@material-ui/core/styles';
import iesiLightTheme from './themes/light.theme';
import iesiDarkTheme from './themes/dark.theme';

export const THEME_STORAGE_KEY = 'IESI_UI_THEME_MODE';

export enum THEMES {
    lightTheme = 'lightTheme',
    darkTheme = 'darkTheme',
}

export type TThemeName = keyof typeof THEMES;

type TTheme = {
    [key in TThemeName]: ThemeOptions;
};

const themeMap: TTheme = {
    lightTheme: iesiLightTheme,
    darkTheme: iesiDarkTheme,
};

export const DEFAULT_THEME = THEMES.lightTheme;

export function getThemeOptionsByName(theme: TThemeName): ThemeOptions {
    return themeMap[theme];
}
