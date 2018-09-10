import {
  fetchFromStorage,
  getExtensionVersion,
  updateStorage
} from "@r2c/extension/utils";

export interface ExperimentManifest {
  [experimentName: string]: boolean;
}

const DEFAULT_EXPERIMENTS = {
  recon: false
};

export interface ExtensionState {
  version: string;
  experiments: ExperimentManifest;
}

const EXTENSION_STATE_KEY = "R2C_EXTENSION_STORED_STATE";

export async function getExtensionState(): Promise<ExtensionState> {
  const state = await fetchFromStorage<ExtensionState>(EXTENSION_STATE_KEY);

  if (state != null) {
    return state;
  } else {
    const defaultExtensionState = {
      version: getExtensionVersion() || "local-development",
      experiments: DEFAULT_EXPERIMENTS
    };

    updateExtensionState(defaultExtensionState);

    return defaultExtensionState;
  }
}

function updateExtensionState(newState: ExtensionState) {
  updateStorage(EXTENSION_STATE_KEY, newState);
}

export function toggleExtensionExperiment(
  extensionState: ExtensionState,
  experimentName: string
): ExtensionState {
  if (extensionState.experiments[experimentName] == null) {
    // do nothing
    return extensionState;
  }

  const newState = {
    ...extensionState,
    experiments: {
      ...extensionState.experiments,
      [experimentName]: !extensionState.experiments[experimentName]
    }
  };

  updateExtensionState(newState);

  return newState;
}
