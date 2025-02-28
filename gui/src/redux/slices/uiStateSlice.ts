import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface HeaderInfo {
  title?: string;
  description?: string;
}

interface UiState {
  bottomMessage: React.ReactNode | null;
  bottomMessageCloseTimeout: NodeJS.Timeout | undefined;
  displayBottomMessageOnBottom: boolean;
  showDialog: boolean;
  dialogMessage: string | JSX.Element;
  dialogEntryOn: boolean;
  activeFilePath: string | undefined;
  headerInfo: HeaderInfo;
}

export const uiStateSlice = createSlice({
  name: "uiState",
  initialState: {
    bottomMessage: null,
    bottomMessageCloseTimeout: undefined,
    showDialog: false,
    dialogMessage: "",
    dialogEntryOn: false,
    displayBottomMessageOnBottom: true,
    activeFilePath: undefined,
    headerInfo: {
      title: '',
      description: ''
    }
  } as UiState,
  reducers: {
    setBottomMessage: (state, action: PayloadAction<React.ReactNode | null>) => {
      state.bottomMessage = action.payload;
    },
    setBottomMessageCloseTimeout: (
      state,
      action: PayloadAction<UiState["bottomMessageCloseTimeout"]>
    ) => {
      if (state.bottomMessageCloseTimeout) {
        clearTimeout(state.bottomMessageCloseTimeout);
      }
      state.bottomMessageCloseTimeout = action.payload;
    },
    setDialogMessage: (
      state,
      action: PayloadAction<UiState["dialogMessage"]>
    ) => {
      state.dialogMessage = action.payload;
    },
    setDialogEntryOn: (
      state,
      action: PayloadAction<UiState["dialogEntryOn"]>
    ) => {
      state.dialogEntryOn = action.payload;
    },
    setShowDialog: (state, action: PayloadAction<UiState["showDialog"]>) => {
      state.showDialog = action.payload;
    },
    setDisplayBottomMessageOnBottom: (
      state,
      action: PayloadAction<UiState["displayBottomMessageOnBottom"]>
    ) => {
      state.displayBottomMessageOnBottom = action.payload;
    },
    setActiveFilePath: (state, action: PayloadAction<UiState["activeFilePath"]>) => {
      // Only set non-empty strings as active file paths
      state.activeFilePath = action.payload && action.payload.length > 0 ? action.payload : undefined;
    },
    setHeaderInfo: (state, action: PayloadAction<HeaderInfo>) => {
      state.headerInfo = action.payload;
    }
  },
});

export const {
  setBottomMessage,
  setBottomMessageCloseTimeout,
  setDialogMessage,
  setDialogEntryOn,
  setShowDialog,
  setDisplayBottomMessageOnBottom,
  setActiveFilePath,
  setHeaderInfo
} = uiStateSlice.actions;
export default uiStateSlice.reducer;
