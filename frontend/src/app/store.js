import { configureStore } from "@reduxjs/toolkit";

const savedUiState = JSON.parse(localStorage.getItem("nexusflow-ui") || "{}");

const initialUiState = {
  themeMode: savedUiState.themeMode || "light",
  sidebarOpen: true,
  compactMode: savedUiState.compactMode || false,
  primaryColor: savedUiState.primaryColor || "#2563eb",
};

function saveUiState(state) {
  localStorage.setItem(
    "nexusflow-ui",
    JSON.stringify({
      themeMode: state.themeMode,
      compactMode: state.compactMode,
      primaryColor: state.primaryColor,
    })
  );
}

function uiReducer(state = initialUiState, action) {
  switch (action.type) {
    case "ui/toggleSidebar": {
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };
    }

    case "ui/setThemeMode": {
      const newState = {
        ...state,
        themeMode: action.payload,
      };

      saveUiState(newState);
      return newState;
    }

    case "ui/setCompactMode": {
      const newState = {
        ...state,
        compactMode: action.payload,
      };

      saveUiState(newState);
      return newState;
    }

    case "ui/setPrimaryColor": {
      const newState = {
        ...state,
        primaryColor: action.payload,
      };

      saveUiState(newState);
      return newState;
    }

    default:
      return state;
  }
}

export const toggleSidebar = () => ({
  type: "ui/toggleSidebar",
});

export const setThemeMode = (mode) => ({
  type: "ui/setThemeMode",
  payload: mode,
});

export const setCompactMode = (enabled) => ({
  type: "ui/setCompactMode",
  payload: enabled,
});

export const setPrimaryColor = (color) => ({
  type: "ui/setPrimaryColor",
  payload: color,
});

export const store = configureStore({
  reducer: {
    ui: uiReducer,
  },
});