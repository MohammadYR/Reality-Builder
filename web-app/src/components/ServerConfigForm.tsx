'use client';

import React, { useState, useEffect } from 'react';

// This interface defines the structure of the server configuration data
export interface ServerConfigData {
  vpsIp: string;
  port: number;
  uuid: string;
  privateKey: string;
  publicKey: string;
  sni: string;
}

// Props for the ServerConfigForm component
interface ServerConfigFormProps {
  selectedIp?: string; // Optional IP from scanner to prefill the form
  onSniChange: (sni: string) => void; // Callback when SNI changes
  onConfigUpdate: (config: ServerConfigData) => void; // Callback when any config value changes
}

// Initial (default) state for the configuration
const initialConfig: ServerConfigData = {
  vpsIp: '',
  port: 443,
  uuid: '', // Will be auto-generated
  privateKey: '', // Will be auto-generated
  publicKey: '', // Will be auto-generated
  sni: 'cloudflare.com', // Default SNI
};

// List of common SNIs for user convenience
const availableSNIs = [
  'cloudflare.com', 'fastly.net', 'www.wikipedia.org', 'cdn.segment.com',
  'assets.hcaptcha.com', 'www.speedtest.net', 'www.visa.com',
  'www.samsung.com', 'www.microsoft.com', 'www.apple.com',
  'www.amazon.com', 'custom'
];

const ServerConfigForm: React.FC<ServerConfigFormProps> = ({ selectedIp, onSniChange, onConfigUpdate }) => {
  const [config, setConfig] = useState<ServerConfigData>(initialConfig);
  const [customSni, setCustomSni] = useState<string>('');
  const [showCustomSniInput, setShowCustomSniInput] = useState(false);

  // --- Placeholder Generation Functions ---
  // These will be replaced by actual xray CLI calls or WASM/Firebase functions later
  const generateUUID = (): string => `uuid-${Math.random().toString(36).substring(2, 15)}`;
  const generateKeyPair = (): { privateKey: string; publicKey: string } => ({
    privateKey: `privkey-${Math.random().toString(36).substring(2, 22)}`,
    publicKey: `pubkey-${Math.random().toString(36).substring(2, 22)}`,
  });

  // Effect to initialize and update config, and notify parent
  useEffect(() => {
    const newKeys = generateKeyPair();
    const newUuid = generateUUID();
    // Initialize config with generated values and selectedIp if available
    const initialVpsIp = selectedIp || initialConfig.vpsIp || '';
    const generatedConfig = {
      ...initialConfig, // Start with defaults
      vpsIp: initialVpsIp,
      uuid: newUuid,
      privateKey: newKeys.privateKey,
      publicKey: newKeys.publicKey,
      // SNI will be default from initialConfig unless changed by user interaction later
    };
    setConfig(generatedConfig);
    onConfigUpdate(generatedConfig); // Notify parent with the fully initialized config
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount for initial generation. selectedIp is part of initial setup.

  // Effect to update vpsIp if selectedIp prop changes *after* initial mount
  useEffect(() => {
    if (selectedIp && selectedIp !== config.vpsIp) {
      setConfig(prev => {
        const updatedConfig = { ...prev, vpsIp: selectedIp };
        onConfigUpdate(updatedConfig);
        return updatedConfig;
      });
    }
    // Do not include config.vpsIp in deps here to avoid loop if selectedIp is passed consistently.
    // This effect is specifically for when selectedIp changes *externally* after mount.
  }, [selectedIp, onConfigUpdate]);


  // Handles changes in form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newConfig = { ...config };
    let currentActiveSni = config.sni;

    if (name === 'sni') {
      if (value === 'custom') {
        setShowCustomSniInput(true);
        // SNI will be set by customSni input, actual config.sni might be the custom value
        currentActiveSni = customSni || ''; // Use current custom SNI if available
      } else {
        setShowCustomSniInput(false);
        newConfig.sni = value;
        currentActiveSni = value;
      }
    } else if (name === 'customSni') {
      setCustomSni(value);
      newConfig.sni = value.trim();
      currentActiveSni = value.trim();
    } else if (name === 'port') {
      newConfig.port = parseInt(value, 10) || 0;
    } else {
      newConfig = { ...newConfig, [name]: value };
    }

    setConfig(newConfig);
    onConfigUpdate(newConfig); // Notify parent of any change
    if (name === 'sni' || name === 'customSni') {
      onSniChange(currentActiveSni);
    }
  };

  // Regenerates UUID and Keys
  const handleGenerateNewKeys = () => {
    const newKeys = generateKeyPair();
    const newUuid = generateUUID();
    setConfig(prev => {
      const updatedConfig = {
        ...prev,
        uuid: newUuid,
        privateKey: newKeys.privateKey,
        publicKey: newKeys.publicKey,
      };
      onConfigUpdate(updatedConfig);
      return updatedConfig;
    });
  };

  // Form submission is handled by parent or other components (e.g. for downloading generated files)
  // This form component itself doesn't have a primary submit action anymore.

  return (
    <div className="w-full max-w-lg p-6 bg-white shadow-md rounded-lg dark:bg-neutral-800">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-200">
        1. Server Parameters
      </h2>
      <div className="space-y-4">
        {/* VPS IP Address */}
        <div>
          <label htmlFor="vpsIp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            VPS IP Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text" name="vpsIp" id="vpsIp" required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
            value={config.vpsIp} onChange={handleChange} placeholder="e.g., 1.2.3.4"
          />
        </div>

        {/* Port */}
        <div>
          <label htmlFor="port" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Port <span className="text-red-500">*</span>
          </label>
          <input
            type="number" name="port" id="port" required min="1" max="65535"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
            value={config.port} onChange={handleChange}
          />
        </div>

        {/* UUID */}
        <div>
          <label htmlFor="uuid" className="block text-sm font-medium text-gray-700 dark:text-gray-300">UUID</label>
          <input
            type="text" name="uuid" id="uuid" readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm bg-gray-100 dark:bg-neutral-700 dark:text-gray-300 sm:text-sm cursor-not-allowed"
            value={config.uuid}
          />
        </div>

        {/* Public Key */}
        <div>
          <label htmlFor="publicKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Public Key (x25519)</label>
          <textarea
            name="publicKey" id="publicKey" readOnly rows={2}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm bg-gray-100 dark:bg-neutral-700 dark:text-gray-300 sm:text-sm cursor-not-allowed"
            value={config.publicKey}
          />
        </div>

        {/* Private Key */}
        <div>
          <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Private Key (x25519)</label>
          <textarea
            name="privateKey" id="privateKey" readOnly rows={2}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm bg-gray-100 dark:bg-neutral-700 dark:text-gray-300 sm:text-sm cursor-not-allowed"
            value={config.privateKey}
          />
        </div>

        {/* Generate New Keys Button */}
        <button
          type="button"
          onClick={handleGenerateNewKeys}
          className="w-full py-2 px-4 border border-gray-300 dark:border-neutral-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Regenerate UUID & Keys
        </button>

        {/* SNI Selection */}
        <div>
          <label htmlFor="sni" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Server Name Indication (SNI) <span className="text-red-500">*</span>
          </label>
          <select
            name="sni" id="sni" required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
            value={showCustomSniInput ? 'custom' : config.sni}
            onChange={handleChange}
          >
            {availableSNIs.map(s => <option key={s} value={s}>{s === 'custom' ? 'Custom...' : s}</option>)}
          </select>
        </div>

        {/* Custom SNI Input */}
        {showCustomSniInput && (
          <div>
            <label htmlFor="customSni" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Custom SNI <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="customSni" id="customSni" required={showCustomSniInput}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
              value={customSni} onChange={handleChange} placeholder="e.g., yourdomain.com"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerConfigForm;
