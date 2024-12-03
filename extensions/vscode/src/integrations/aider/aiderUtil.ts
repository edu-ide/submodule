import * as vscode from "vscode";
import * as cp from "child_process";
import { Core } from "core/core";
import { ContinueGUIWebviewViewProvider, PEAR_OVERLAY_VIEW_ID } from "../../ContinueGUIWebviewViewProvider";
import { getIntegrationTab } from "../../util/integrationUtils";
import Aider from "core/llm/llms/AiderLLM";
import { execSync } from "child_process";
import { isFirstPearAICreatorLaunch } from "../../copySettings";
import { VsCodeWebviewProtocol } from "../../webviewProtocol";
import * as os from "os";

export const PEARAI_AIDER_VERSION = "0.65.0";

const PLATFORM = process.platform;
const IS_WINDOWS = PLATFORM === "win32";
const IS_MAC = PLATFORM === "darwin";
const IS_LINUX = PLATFORM === "linux";

let aiderPanel: vscode.WebviewPanel | undefined;

// Aider process management functions
// startAiderProcess is in util because if it is in aiderProcess, it introduces circular dependencies between aiderProcess.ts and aiderLLM.ts
export async function startAiderProcess(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModel = config.models.find((model) => model instanceof Aider) as
    | Aider
    | undefined;

  if (!aiderModel) {
    console.warn("No Aider model found in configuration");
    return;
  }

  // Check if current workspace is a git repo
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    await aiderModel.setAiderState({state: "notgitrepo"});
    // vscode.window.showErrorMessage('Please open a workspace folder to use PearAI Creator.');
    return;
  }

  const isGitRepo = await isGitRepository(workspaceFolders[0].uri.fsPath);
  if (!isGitRepo) {
    console.dir("setting state to notgitrepo");
    await aiderModel.setAiderState({state: "notgitrepo"});
    return;
  }

  const isAiderInstalled = await checkAiderInstallation();

  if (!isAiderInstalled) {
    await aiderModel.setAiderState({state: "uninstalled"});
    return;
  }
  

  try {
    await aiderModel.startAiderChat(aiderModel.model, aiderModel.apiKey);
  } catch (e) {
    console.warn(`Error starting Aider process: ${e}`);
  }
}

export async function sendAiderProcessStateToGUI(core: Core, webviewProtocol: VsCodeWebviewProtocol) {
  const config = await core.configHandler.loadConfig();
  const aiderModel = config.models.find((model) => model instanceof Aider) as
    | Aider
    | undefined;


  if (!aiderModel) {
    webviewProtocol?.request("setAiderProcessStateInGUI", { state: "stopped" }, [PEAR_OVERLAY_VIEW_ID]);
    return;
  }
  console.dir("Sending state to Aider GUI:");
  console.dir(aiderModel.getAiderState())
  webviewProtocol?.request("setAiderProcessStateInGUI", aiderModel.getAiderState(), [PEAR_OVERLAY_VIEW_ID]);
}

export async function killAiderProcess(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModels = config.models.filter(
    (model) => model instanceof Aider,
  ) as Aider[];

  try {
    if (aiderModels.length > 0) {
      aiderModels.forEach((model) => {
        model.killAiderProcess();
      });
    }
  } catch (e) {
    console.warn(`Error killing Aider process: ${e}`);
  }
}

export async function aiderCtrlC(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModels = config.models.filter(
    (model) => model instanceof Aider,
  ) as Aider[];

  try {
    if (aiderModels.length > 0) {
      aiderModels.forEach((model) => {
        if (Aider.aiderProcess) {
          model.aiderCtrlC();
        }
      });
      // This is when we cancelled an ongoing request
    }
  } catch (e) {
    console.warn(`Error sending Ctrl-C to Aider process: ${e}`);
  }
}

export async function aiderResetSession(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModel = config.models.find(
    (model) => model instanceof Aider
  ) as Aider | undefined;

  try {
    if (aiderModel && Aider.aiderProcess) {
      aiderModel.aiderResetSession(aiderModel.model, aiderModel.apiKey);
    }
  } catch (e) {
    console.warn(`Error resetting Aider session: ${e}`);
  }
}


export async function installAider(core: Core) {
  // Step 1: Check if Aider is already installed
  const isAiderInstalled = await checkAiderInstallation();
  if (isAiderInstalled) {
    return false;
  }

  // Step 2: For Mac/Linux, check and install Homebrew first
  if (!IS_WINDOWS) {
    const isBrewInstalled = await checkBrewInstallation();
    if (!isBrewInstalled) {
      vscode.window.showErrorMessage(
        "Homebrew is required for Mac/Linux installation. Please install Homebrew and try again."
      );
      return true;
    }

    try {
      console.log("Installing pipx via Homebrew...");
      execSync("brew install pipx");
      execSync("pipx ensurepath");
    } catch (error) {
      console.error("Failed to install pipx:", error);
      vscode.window.showErrorMessage("Failed to install pipx. Please try again.");
      return true;
    }
  }

  // Step 3: Check Python installation
  const isPythonInstalled = await checkPythonInstallation();
  if (!isPythonInstalled) {
    vscode.window.showErrorMessage(
      "Python is required but not found. Please install Python 3 and try again."
    );
    return true;
  }

  console.log("Installing Aider...");

  // Step 4: Install and configure pipx
  try {
    console.log("Installing and configuring pipx...");
    execSync(`python3.9 -m pip install pipx`);
    execSync(`python3.9 -m pipx ensurepath`);
  } catch (error) {
    console.error("Failed to install/configure pipx:", error);
    vscode.window.showErrorMessage("Failed to install pipx. Please try again.");
    return true;
  }

  // Step 5: Install Aider via pipx
  try {
    console.log("Installing Aider via pipx...");
    execSync(`python3.9 -m pipx install --python python3.9 aider-chat==${PEARAI_AIDER_VERSION}`);
  } catch (error) {
    console.error("Failed to install Aider via pipx:", error);
    vscode.window.showErrorMessage("Failed to install Aider. Please try again.");
    return true;
  }

  // Step 6: Verify installation
  const verifyInstallation = await checkAiderInstallation();
  if (!verifyInstallation) {
    console.error("Aider installation verification failed");
    vscode.window.showErrorMessage("Aider installation verification failed");
    return true;
  }

  // Step 7: Installation successful
  vscode.window.showInformationMessage(`Aider ${PEARAI_AIDER_VERSION} installation completed successfully.`);
  core.invoke("llm/startAiderProcess", undefined);
  return false;
}

export async function uninstallAider(core: Core) {
  const isAiderInstalled = await checkAiderInstallation();
  if (!isAiderInstalled) {
    return;
  }
  vscode.window.showInformationMessage("Uninstalling Aider...");
  if (IS_WINDOWS) {
    execSync("python3.9 -m pipx uninstall aider-chat");
  } else {
    execSync("brew uninstall aider");
  }
}

export async function openAiderPanel(
  core: Core,
  sidebar: ContinueGUIWebviewViewProvider,
  extensionContext: vscode.ExtensionContext,
) {
  // Check if aider is already open by checking open tabs
  const aiderTab = getIntegrationTab("pearai.aiderGUIView");
  console.log("Aider tab found:", aiderTab);
  console.log("Aider tab active:", aiderTab?.isActive);
  console.log("Aider panel exists:", !!aiderPanel);

  // Check if the active editor is the Continue GUI View
  if (aiderTab && aiderTab.isActive) {
    vscode.commands.executeCommand("workbench.action.closeActiveEditor"); //this will trigger the onDidDispose listener below
    return;
  }

  if (aiderTab && aiderPanel) {
    //aider open, but not focused - focus it
    aiderPanel.reveal();
    return;
  }

  //create the full screen panel
  let panel = vscode.window.createWebviewPanel(
    "pearai.aiderGUIView",
    "PearAI Creator (Powered by aider)",
    vscode.ViewColumn.One,
    {
      retainContextWhenHidden: true,
    },
  );
  aiderPanel = panel;

  //Add content to the panel
  panel.webview.html = sidebar.getSidebarContent(
    extensionContext,
    panel,
    undefined,
    undefined,
    true,
    "/aiderMode",
  );

  sidebar.webviewProtocol?.request(
    "focusContinueInputWithNewSession",
    undefined,
    ["pearai.aiderGUIView"],
  );

  //When panel closes, reset the webview and focus
  panel.onDidDispose(
    () => {
      // Kill background process
      // core.invoke("llm/killAiderProcess", undefined);

      // The following order is important as it does not reset the history in chat when closing creator
      vscode.commands.executeCommand("pearai.focusContinueInput");
      sidebar.resetWebviewProtocolWebview();
    },
    null,
    extensionContext.subscriptions,
  );
}
export function getUserShell(): string {
  if (IS_WINDOWS) {
    return process.env.COMSPEC || "cmd.exe";
  }
  return process.env.SHELL || "/bin/sh";
}

export function getUserPath(): string {
  try {
    let pathCommand: string;
    const shell = getUserShell();

    if (os.platform() === "win32") {
      // For Windows, we'll use a PowerShell command
      pathCommand =
        "powershell -Command \"[Environment]::GetEnvironmentVariable('Path', 'User') + ';' + [Environment]::GetEnvironmentVariable('Path', 'Machine')\"";
    } else {
      // For Unix-like systems (macOS, Linux)
      pathCommand = `${shell} -ilc 'echo $PATH'`;
    }

    return execSync(pathCommand, { encoding: "utf8" }).trim();
  } catch (error) {
    console.error("Error getting user PATH:", error);
    return process.env.PATH || "";
  }
}

// Utility functions for installation and checks
export async function checkPythonInstallation(): Promise<boolean> {
  try {
    const pythonVersion = await executeCommand("python3 --version");
    const version = pythonVersion.match(/Python (\d+\.\d+)/);
    if (version && parseFloat(version[1]) >= 3.9) {
      return true;
    }
    
    // If Python version is less than 3.9 or not found, try to install Python 3.9
    if (IS_MAC) {
      console.log("Installing Python 3.9 via Homebrew...");
      await executeCommand("brew install python@3.9");
      await executeCommand("brew link python@3.9");
    } else if (IS_LINUX) {
      console.log("Installing Python 3.9...");
      if (await (await executeCommand("which apt")).length > 0) {
        // Debian/Ubuntu
        await executeCommand("sudo apt update");
        await executeCommand("sudo apt install -y python3.9");
      } else if (await (await executeCommand("which dnf")).length > 0) {
        // Fedora/RHEL
        await executeCommand("sudo dnf install -y python39");
      }
    } else if (IS_WINDOWS) {
      console.log("Please install Python 3.9 from python.org");
      vscode.window.showErrorMessage(
        "Python 3.9 is required. Please install it from python.org and try again."
      );
      return false;
    }

    // Verify installation
    const newPythonVersion = await executeCommand("python3.9 --version");
    return newPythonVersion.includes("Python 3.9");
  } catch (error) {
    console.warn(`Python 3.9 check/installation failed: ${error}`);
    return false;
  }
}

export async function checkAiderInstallation(): Promise<boolean> {
  const commands = [
    "python3.9 -m aider --version",
  ];

  for (const cmd of commands) {
    try {
      await executeCommand(cmd);
      return true;
    } catch (error) {
      console.warn(`Failed to execute ${cmd}: ${error}`);
    }
  }
  return false;
}

export async function checkBrewInstallation(): Promise<boolean> {
  try {
    await executeCommand("brew --version");
    return true;
  } catch (error) {
    console.warn(`Brew is not installed: ${error}`);
    return false;
  }
}

export async function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cp.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error);
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function checkGitRepository(currentDirectory?: string): Promise<boolean> {
  try {
      const currentDir = currentDirectory || process.cwd();
      // Use a more robust git check method
      execSync('git rev-parse --is-inside-work-tree', { cwd: currentDir });
      return true;
  } catch {
      return false;
  }
}

export function checkCredentials(model: string, credentials: { getAccessToken: () => string | undefined }): boolean {
  // Implement credential check logic
  if (!model.includes("claude") && !model.includes("gpt")) {
      const accessToken = credentials.getAccessToken();
      return !!accessToken;
  }
  return true;
}

export async function getCurrentWorkingDirectory(getCurrentDirectory?: () => Promise<string>): Promise<string> {
  if (getCurrentDirectory) {
      return await getCurrentDirectory();
  }
  return process.cwd();
}

// check if directory is a git repo
async function isGitRepository(directory: string): Promise<boolean> {
  try {
    const result = execSync('git rev-parse --is-inside-work-tree', {
      cwd: directory,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf-8'
    }).trim();
    return result === 'true';
  } catch (error) {
    console.log('Aider Error:Directory is not a git repository:', error);
    return false;
  }
}
