'use client';

import React, { useState } from 'react';

interface ConnectionTesterProps {
  // Props needed to perform tests, e.g., the generated client config or server details
  vpsIp: string;
  port: number;
  uuid: string;
  publicKey: string; // Reality public key
  sni: string;
  // Potentially the full vless link or parts of it
}

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failure' | 'error';
  message?: string;
  details?: string; // For more detailed output, e.g., curl output
}

const ConnectionTester: React.FC<ConnectionTesterProps> = ({ vpsIp, port, uuid, publicKey, sni }) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const testsToRun = [
    {
      name: 'Basic Connectivity (ping-like)',
      id: 'ping',
      // In a real scenario, this would be an API call to a backend that can ping.
      // Browsers can't directly ping. We can simulate or use a fetch to a known endpoint on the VPS.
      action: async () => {
        // Placeholder: Simulate a fetch to the VPS IP/Port to check reachability
        // This is NOT a true ping. For a real ping, backend is needed.
        try {
          // A more realistic check might be a small fetch to a known path on the server
          // if there's an HTTP server running, or a specific health check endpoint.
          // For now, just simulating success/failure.
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
          if (Math.random() > 0.2) return { status: 'success', message: 'VPS seems reachable.' };
          return { status: 'failure', message: 'VPS IP or Port might be unreachable.' };
        } catch (e: any) {
          return { status: 'error', message: `Error: ${e.message}` };
        }
      }
    },
    {
      name: 'TLS Handshake & SNI Match (curl-like)',
      id: 'curl_resolve',
      action: async () => {
        // This requires a backend call to execute:
        // curl --resolve SNI:PORT:VPS_IP https://SNI -v --max-time 5
        // For now, simulate the result.
        await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 800));
        if (!vpsIp || !port || !sni) return {status: 'error', message: 'Missing IP, Port or SNI for test.'}
        const success = Math.random() > 0.3; // Simulate success rate
        return {
          status: success ? 'success' : 'failure',
          message: success ? 'TLS handshake successful with SNI.' : 'TLS handshake or SNI match failed.',
          details: success ? `Simulated: curl --resolve ${sni}:${port}:${vpsIp} https://${sni} -v OK` : `Simulated: curl --resolve ${sni}:${port}:${vpsIp} https://${sni} -v FAILED (check SNI, port, firewall, or if Xray is running)`
        };
      }
    },
    {
      name: 'Xray Reality Probe (xray-knife)',
      id: 'xray_probe',
      action: async () => {
        // This requires a backend call to execute xray-knife or similar.
        // xray-knife probe -x xray_config.json (or specific params)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        if (!publicKey || !uuid) return {status: 'error', message: 'Missing UUID or Public Key for test.'}
        const success = Math.random() > 0.25; // Simulate success rate
        return {
          status: success ? 'success' : 'failure',
          message: success ? 'Xray Reality probe successful.' : 'Xray Reality probe failed.',
          details: success ? 'Simulated: xray-knife probe reported OK.' : 'Simulated: xray-knife probe failed. Check Reality config, keys, UUID, SNI.'
        };
      }
    },
    // { name: 'Data Transfer Speed (iperf-like)', id: 'iperf', action: async () => { /* placeholder */ return { status: 'pending' }; } },
  ];

  const handleRunTests = async () => {
    if (!vpsIp || port === 0 || !uuid || !publicKey || !sni) {
        alert('Please ensure server configuration (IP, Port, UUID, Public Key, SNI) is complete before testing.');
        return;
    }
    setIsTesting(true);
    const initialResults = testsToRun.map(test => ({ ...test, status: 'pending' } as TestResult));
    setTestResults(initialResults);

    for (let i = 0; i < testsToRun.length; i++) {
      const test = testsToRun[i];
      setTestResults(prev => prev.map(r => r.name === test.name ? { ...r, status: 'running' } : r));
      try {
        const result = await test.action();
        setTestResults(prev => prev.map(r => r.name === test.name ? { ...r, ...result } : r));
      } catch (e: any) {
        console.error(`Error during test "${test.name}":`, e);
        setTestResults(prev => prev.map(r => r.name === test.name ? { ...r, status: 'error', message: e.message || 'Test execution error' } : r));
      }
    }
    setIsTesting(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-500 dark:text-green-400';
      case 'failure': return 'text-red-500 dark:text-red-400';
      case 'error': return 'text-red-700 dark:text-red-500';
      case 'running': return 'text-yellow-500 dark:text-yellow-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'failure': return '❌';
      case 'error': return '❗';
      case 'running': return '⏳';
      default: return '⚪';
    }
  }

  return (
    <div className="w-full max-w-2xl p-6 mt-8 bg-white shadow-md rounded-lg dark:bg-neutral-800">
      <h2 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">
        Connection Tester
      </h2>
      <button
        onClick={handleRunTests}
        disabled={isTesting || !vpsIp || !sni || !publicKey || !uuid} // Basic validation
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Run Connection Tests'}
      </button>

      {testResults.length > 0 && (
        <div className="mt-6 space-y-3">
          {testResults.map((result) => (
            <div key={result.name} className="p-3 border rounded-md bg-gray-50 dark:bg-neutral-700 dark:border-neutral-600">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-200">{result.name}</span>
                <span className={`font-semibold ${getStatusColor(result.status)}`}>
                  {getStatusIcon(result.status)} {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                </span>
              </div>
              {result.message && <p className={`text-xs mt-1 ${getStatusColor(result.status)}`}>{result.message}</p>}
              {result.details && <pre className="mt-1 p-2 text-xs bg-gray-100 dark:bg-neutral-900 rounded overflow-x-auto">{result.details}</pre>}
            </div>
          ))}
        </div>
      )}
       <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Note: Tests are simulated. Actual testing requires backend/CLI integration for ping, curl, and xray-knife.
        </p>
    </div>
  );
};

export default ConnectionTester;
