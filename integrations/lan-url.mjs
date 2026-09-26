// Prints the phone URL when the dev server runs in WSL2 with --host.
// Astro only sees WSL's internal 172.x addresses; phones on the LAN reach
// the dev server through a Windows portproxy on the Windows host's LAN IP.
import { execFile } from "node:child_process";

const PROXY_PORT = 4321; // port the Windows portproxy forwards to WSL

function windowsLanIp() {
  return new Promise((resolve) => {
    execFile("ipconfig.exe", { timeout: 3000 }, (error, stdout) => {
      if (error) return resolve(undefined);
      const lines = stdout.split(/\r?\n/);
      // Adapter with a default gateway: IPv4, mask, then gateway line.
      for (const [i, line] of lines.entries()) {
        const ip = line.match(/IPv4.*:\s*([\d.]+)/)?.[1];
        const gateway = lines[i + 2]?.match(/:\s*(\d+\.\d+\.\d+\.\d+)\s*$/);
        if (ip && gateway) return resolve(ip);
      }
      resolve(undefined);
    });
  });
}

/** @returns {import("astro").AstroIntegration} */
export default function lanUrl() {
  return {
    name: "lan-url",
    hooks: {
      "astro:server:start": async ({ address, logger }) => {
        const exposed = !["127.0.0.1", "::1", "localhost"].includes(
          address.address,
        );
        if (!process.env.WSL_DISTRO_NAME || !exposed) return;

        const ip = await windowsLanIp();
        if (!ip) return;
        logger.info(`Phone (LAN): http://${ip}:${PROXY_PORT}/`);
        if (address.port !== PROXY_PORT) {
          logger.warn(
            `Dev server is on port ${address.port}, but the portproxy forwards ${PROXY_PORT}. ` +
              `Stop whatever holds ${PROXY_PORT} (ss -ltnp | grep ${PROXY_PORT}) and restart.`,
          );
        }
      },
    },
  };
}
