import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Check if a port is in use
 */
export async function isPortInUse(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    return stdout.trim().length > 0;
  } catch (error) {
    // Port is not in use if lsof returns error
    return false;
  }
}

/**
 * Kill process using a port
 */
export async function killProcessOnPort(port) {
  try {
    await execAsync(`lsof -ti:${port} | xargs kill -9`);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Find an available port starting from the given port
 */
export async function findAvailablePort(startPort = 3000, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
  }
  return null;
}

