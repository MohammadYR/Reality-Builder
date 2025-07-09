'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ScannedIp {
  ip: string;
  latency?: number;
  packetLoss?: number;
  isWhitelisted?: boolean; // Assuming IP+SNI match indicates whitelisting for Reality
  // Potentially add region, ISP, etc.
}

interface IpScannerProps {
  onIpSelect: (ip: string) => void;
  currentSni: string; // Needed for testing IP+SNI match
}

const CLOUDFLARE_IPS_URL = 'https://www.cloudflare.com/ips-v4';
// Alternative: https://api.cloudflare.com/client/v4/ips (needs auth, more structured)
// For simplicity, using the plain text list first.

const IpScanner: React.FC<IpScannerProps> = ({ onIpSelect, currentSni }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ipList, setIpList] = useState<string[]>([]);
  const [scannedResults, setScannedResults] = useState<ScannedIp[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const fetchCloudflareIps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Due to CORS restrictions, fetching directly from www.cloudflare.com/ips-v4
      // in the browser will likely fail. This needs to be fetched via a backend/proxy.
      // For now, I'll simulate this with a placeholder or a direct call if using a proxy.
      // Option 1: Use a proxy (e.g., a Firebase Function)
      // const response = await fetch('/api/cloudflare-ips'); // Your proxy endpoint

      // Option 2: Placeholder for direct call for now (will likely fail due to CORS)
      // or if a proxy is set up at the Next.js level (e.g. next.config.js rewrites)
      // const response = await fetch(CLOUDFLARE_IPS_URL);

      // Placeholder: Simulate fetched IPs
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const rawIps = `173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22`;
      // Basic parsing of CIDR ranges (very simplified, doesn't expand ranges yet)
      const parsedIps = rawIps.split('\n').filter(ip => ip.trim() !== '' && !ip.startsWith('#'));
      setIpList(parsedIps);

      // Actual implementation would involve parsing CIDR blocks properly.
      // For now, we'll treat them as single representative IPs or just the network addresses.

    } catch (err) {
      console.error('Error fetching Cloudflare IPs:', err);
      setError('Failed to fetch Cloudflare IP list. This might be a CORS issue if not using a proxy.');
      setIpList([]); // Clear list on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCloudflareIps();
  }, [fetchCloudflareIps]);

  const handleScanIp = async (ipToScan: string) => {
    // This is where xray-knife integration would happen.
    // It needs to be a call to a backend function or a Tauri command.
    console.log(`Simulating scan for IP: ${ipToScan} with SNI: ${currentSni}`);

    // Simulate scan result
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    const latency = 50 + Math.floor(Math.random() * 200); // ms
    const packetLoss = Math.random() < 0.1 ? Math.floor(Math.random() * 10) : 0; // %
    const isWhitelisted = Math.random() < 0.7; // Simulate 70% chance of being whitelisted

    return { ip: ipToScan, latency, packetLoss, isWhitelisted };
  };

  const handleStartFullScan = async () => {
    if (!ipList.length) {
      setError("IP list is empty. Fetch IPs first.");
      return;
    }
    setIsScanning(true);
    setScannedResults([]);
    setError(null);

    const results: ScannedIp[] = [];
    // For a real scan, you'd want to process these in batches or with concurrency control.
    // And properly expand CIDR ranges to individual IPs if desired.
    for (const ip of ipList.slice(0, 10)) { // Limiting to 10 for this demo
      try {
        const result = await handleScanIp(ip);
        results.push(result);
        setScannedResults([...results]); // Update UI progressively
      } catch (scanError) {
        console.error(`Error scanning IP ${ip}:`, scanError);
        results.push({ ip, isWhitelisted: false, latency: undefined, packetLoss: undefined });
        setScannedResults([...results]);
      }
    }

    // Sort results (example: by latency, then whitelist status)
    results.sort((a, b) => {
      if (a.isWhitelisted && !b.isWhitelisted) return -1;
      if (!a.isWhitelisted && b.isWhitelisted) return 1;
      return (a.latency || Infinity) - (b.latency || Infinity);
    });
    setScannedResults(results);
    setIsScanning(false);
  };

  return (
    <div className="w-full max-w-2xl p-6 mt-8 bg-white shadow-md rounded-lg dark:bg-neutral-800">
      <h2 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">
        IP Scanner (Cloudflare)
      </h2>
      {error && <p className="text-sm text-red-500 dark:text-red-400 mb-3">{error}</p>}

      <div className="mb-4">
        <button
          onClick={fetchCloudflareIps}
          disabled={isLoading || isScanning}
          className="w-full mb-2 py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 disabled:opacity-50"
        >
          {isLoading ? 'Fetching IP List...' : 'Re-fetch Cloudflare IP List'}
        </button>
        <button
          onClick={handleStartFullScan}
          disabled={isLoading || isScanning || ipList.length === 0}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isScanning ? 'Scanning...' : `Scan Top IPs (Max 10 for demo)`}
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Note: Full scan tests a limited number of IPs from the fetched list for this demo.
          Actual scanning requires backend/CLI integration for `xray-knife`.
        </p>
      </div>

      {scannedResults.length > 0 && (
        <div className="mt-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Scan Results (SNI: {currentSni || 'Not Set'}):</h3>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
            <thead className="bg-gray-50 dark:bg-neutral-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IP</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Latency</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Loss</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reality OK?</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
              {scannedResults.map((res) => (
                <tr key={res.ip} className={`${!res.isWhitelisted ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{res.ip}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{res.latency !== undefined ? `${res.latency} ms` : 'N/A'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{res.packetLoss !== undefined ? `${res.packetLoss}%` : 'N/A'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {res.isWhitelisted === undefined ? 'N/A' : (res.isWhitelisted ? '✅ Yes' : '❌ No')}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onIpSelect(res.ip)}
                      disabled={!res.isWhitelisted}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Use this IP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IpScanner;
