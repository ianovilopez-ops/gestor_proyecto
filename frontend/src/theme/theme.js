import { createTheme } from "@mui/material/styles";

export function getAppTheme({
  mode = "light",
  compactMode = false,
  primaryColor = "#2563eb",
} = {}) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: "#7c3aed",
      },
      background: {
        default: isDark ? "#020617" : "#f5f7fb",
        paper: isDark ? "#0f172a" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f8fafc" : "#111827",
        secondary: isDark ? "#cbd5e1" : "#6b7280",
      },
      divider: isDark ? "#1e293b" : "#e5e7eb",
    },
    typography: {
      fontFamily: `"Inter", "Roboto", "Arial", sans-serif`,
      fontSize: compactMode ? 13 : 14,
      h4: {
        fontWeight: 800,
        fontSize: compactMode ? "1.7rem" : "2.125rem",
      },
      h5: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 700,
        fontSize: compactMode ? "1rem" : "1.25rem",
      },
      button: {
        textTransform: "none",
        fontWeight: 700,
      },
    },
    shape: {
      borderRadius: compactMode ? 12 : 16,
    },
    spacing: compactMode ? 6 : 8,
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: compactMode ? 14 : 20,
            boxShadow: isDark
              ? "0 10px 30px rgba(0, 0, 0, 0.35)"
              : "0 10px 30px rgba(15, 23, 42, 0.08)",
            border: isDark ? "1px solid #1e293b" : "none",
            backgroundImage: "none",
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: compactMode ? "16px" : "24px",
            "&:last-child": {
              paddingBottom: compactMode ? "16px" : "24px",
            },
          },
        },
      },
      MuiButton: {
        defaultProps: {
          size: compactMode ? "small" : "medium",
        },
        styleOverrides: {
          root: {
            borderRadius: compactMode ? 10 : 12,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: compactMode ? "small" : "medium",
        },
      },
      MuiFormControl: {
        defaultProps: {
          size: compactMode ? "small" : "medium",
        },
      },
      MuiChip: {
        defaultProps: {
          size: compactMode ? "small" : "medium",
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: compactMode ? 14 : 20,
            backgroundImage: "none",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
}