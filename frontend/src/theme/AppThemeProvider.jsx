import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { getAppTheme } from "./theme.js";

export function AppThemeProvider({ children }) {
  const themeMode = useSelector((state) => state.ui.themeMode);
  const compactMode = useSelector((state) => state.ui.compactMode);
  const primaryColor = useSelector((state) => state.ui.primaryColor);

  const theme = useMemo(
    () =>
      getAppTheme({
        mode: themeMode,
        compactMode,
        primaryColor,
      }),
    [themeMode, compactMode, primaryColor]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}