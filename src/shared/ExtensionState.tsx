import { fetchFromStorage, updateStorage } from "@r2c/extension/utils";

export type ExperimentName =
  | "permissions"
  | "hideOnUnsupported"
  | "emptyPlaceholder";

export type ExperimentManifest = { [E in ExperimentName]: boolean };

const DEFAULT_EXPERIMENTS: ExperimentManifest = {
  permissions: true,
  hideOnUnsupported: false,
  emptyPlaceholder: false
};

export interface ExtensionState {
  experiments: ExperimentManifest;
}

const EXTENSION_STATE_KEY = "R2C_EXTENSION_STORED_STATE";

export async function getExtensionState(): Promise<ExtensionState> {
  const state = await fetchFromStorage<ExtensionState>(EXTENSION_STATE_KEY);

  if (state != null) {
    return state;
  } else {
    const defaultExtensionState = {
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
  experimentName: ExperimentName
): ExtensionState {
  if (!DEFAULT_EXPERIMENTS.hasOwnProperty(experimentName)) {
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
