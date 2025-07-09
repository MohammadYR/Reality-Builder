import { ServerConfigData } from "@/components/ServerConfigForm"; // Assuming ServerConfigData is exported

/**
 * Generates a VLESS link from the server configuration.
 *
 * Standard VLESS format:
 * vless://<uuid>@<ip_or_domain>:<port>?type=<type>&security=<security>&path=<path>&host=<host>&headerType=<headerType>&encryption=<encryption>&flow=<flow>&sni=<sni>&fp=<fingerprint>&pbk=<publicKey>&sid=<shortId>#<remarks>
 *
 * For Reality:
 * security=reality
 * encryption=none (usually)
 * sni, fp, pbk, sid are used in realityOpts
 */
export const generateVlessLink = (config: ServerConfigData): string => {
  if (!config.vpsIp || !config.uuid || !config.publicKey || !config.sni) {
    console.warn("Attempted to generate VLESS link with incomplete configuration.");
    return "";
  }

  const uuid = config.uuid;
  const address = config.vpsIp; // Assuming direct IP, no domain resolution here
  const port = config.port;
  const remarks = encodeURIComponent(`reality-${config.vpsIp}`); // Simple remark

  // Reality specific parameters
  const security = "reality";
  const sni = config.sni;
  const publicKey = config.publicKey;

  // Placeholder for shortId - can be derived or randomly generated.
  // Using first 8 chars of private key hash for deterministic placeholder, NOT secure for production.
  // In a real scenario, xray x25519 genkey generates short_id along with keys.
  // For now, taking a part of public key as a simple placeholder.
  const shortId = config.publicKey.substring(0, 8).toLowerCase().replace(/[^a-z0-9]/g, '');

  const fingerprint = 'chrome'; // Common default, can be configurable: chrome, firefox, safari, ios, random
  const flow = 'xtls-rprx-vision'; // Common for Reality
  const type = 'tcp'; // Assuming TCP for now
  const encryption = 'none';

  // Basic parameters
  let link = `vless://${uuid}@${address}:${port}`;

  // Query parameters
  const queryParams = new URLSearchParams();
  queryParams.append('type', type);
  queryParams.append('security', security);
  queryParams.append('sni', sni);
  queryParams.append('fp', fingerprint);
  queryParams.append('pbk', publicKey);
  if (shortId) {
    queryParams.append('sid', shortId);
  }
  queryParams.append('flow', flow);
  // queryParams.append('encryption', encryption); // encryption=none is often implied or default with reality

  link += `?${queryParams.toString()}`;
  link += `#${remarks}`;

  return link;
};

// Placeholder for Xray config.json generation (can be expanded from ServerConfigForm's logic)
export const generateXrayServerConfigJson = (config: ServerConfigData): object => {
  return {
    log: { loglevel: "warning" },
    inbounds: [
      {
        port: config.port,
        protocol: "vless",
        settings: {
          clients: [
            {
              id: config.uuid,
              flow: "xtls-rprx-vision" // Ensure this matches client if specified
            }
          ],
          decryption: "none"
        },
        streamSettings: {
          network: "tcp",
          security: "reality",
          realitySettings: {
            show: false, // Recommended to keep false
            dest: `${config.sni}:443`, // Default destination, should ideally be a real site that SNI points to
            xver: 0, // Protocol version, 0 for now
            serverNames: [config.sni],
            privateKey: config.privateKey,
            // publicKey: config.publicKey, // Xray derives public key from private key
            // minClientVer: "1.8.0", // Optional: enforce min client version
            // maxClientVer: "1.8.0", // Optional: enforce max client version
            // maxTimeDiff: 60000, // Optional: max time difference in ms
            shortIds: [config.publicKey.substring(0, 8).toLowerCase().replace(/[^a-z0-9]/g, '')], // Must be an array, ensure it matches client's sid
            // "spiderX": "/" // Optional: path for spidering
          }
        }
      }
    ],
    outbounds: [
      { protocol: "freedom", tag: "direct" },
      { protocol: "blackhole", tag: "blocked" }
    ]
  };
};
