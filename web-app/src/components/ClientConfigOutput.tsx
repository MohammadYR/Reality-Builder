'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { saveAs } from 'file-saver';
import { ServerConfigData } from './ServerConfigForm'; // Assuming ServerConfigData is exported from here
import { generateVlessLink, generateXrayServerConfigJson } from '@/utils/configGenerators';

interface ClientConfigOutputProps {
  config: ServerConfigData | null;
  onDownloadServerConfig: (configData: ServerConfigData) => void; // Callback to trigger server config download
}

const ClientConfigOutput: React.FC<ClientConfigOutputProps> = ({ config, onDownloadServerConfig }) => {
  const [vlessLink, setVlessLink] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (config && config.vpsIp && config.uuid && config.publicKey && config.sni) {
      const link = generateVlessLink(config);
      setVlessLink(link);
      if (link) {
        QRCode.toDataURL(link, { errorCorrectionLevel: 'M', width: 256 })
          .then(url => setQrCodeDataUrl(url))
          .catch(err => {
            console.error('Failed to generate QR code', err);
            setQrCodeDataUrl('');
          });
      } else {
        setQrCodeDataUrl('');
      }
    } else {
      setVlessLink('');
      setQrCodeDataUrl('');
    }
  }, [config]);

  const handleCopyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy to clipboard.');
    });
  };

  const handleDownloadQrCode = () => {
    if (qrCodeDataUrl && config) {
      fetch(qrCodeDataUrl)
        .then(res => res.blob())
        .then(blob => {
          saveAs(blob, `reality_qr_${config.vpsIp || 'server'}.png`);
        })
        .catch(err => {
          console.error('Failed to download QR code:', err);
          alert('Failed to download QR code.');
        });
    }
  };

  const handleDownloadServerJson = () => {
    if (config) {
      onDownloadServerConfig(config);
    }
  }

  if (!config) {
    return (
      <div className="w-full max-w-md p-4 mt-6 bg-gray-50 shadow rounded-lg dark:bg-neutral-800/50 text-center">
        <p className="text-gray-500 dark:text-gray-400">Server configuration not yet available or complete.</p>
      </div>
    );
  }

  if (!vlessLink) {
     return (
      <div className="w-full max-w-md p-4 mt-6 bg-gray-50 shadow rounded-lg dark:bg-neutral-800/50 text-center">
        <p className="text-orange-500 dark:text-orange-400">Please complete all required server settings (IP, Port, SNI) to generate client configs.</p>
         <button
            onClick={handleDownloadServerJson}
            className="mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Download Server config.json
          </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg p-6 mt-6 bg-white shadow-md rounded-lg dark:bg-neutral-800">
      <h2 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">
        Client Configuration
      </h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-1">VLESS Link:</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={vlessLink}
              className="flex-grow p-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm bg-gray-100 dark:bg-neutral-700 dark:text-gray-200 text-xs"
            />
            <button
              onClick={() => handleCopyToClipboard(vlessLink)}
              className="px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Copy
            </button>
          </div>
        </div>

        {qrCodeDataUrl && (
          <div className="text-center border-t border-gray-200 dark:border-neutral-700 pt-4">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">QR Code:</h3>
            <div className="flex justify-center">
              <img
                src={qrCodeDataUrl}
                alt="VLESS QR Code"
                className="border border-gray-300 dark:border-neutral-600 rounded-md"
                width={256}
                height={256}
              />
            </div>
            <button
              onClick={handleDownloadQrCode}
              className="mt-2 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Download QR Code (.png)
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Scan with your client app.</p>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-1">Server `config.json`:</h3>
             <button
                onClick={handleDownloadServerJson}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Download Server config.json
              </button>
        </div>

        {/* Placeholder for Copyable CLI Snippets */}
        <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-1">CLI Snippets:</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                (Coming soon: Copyable snippets for v2rayNG, Clash, Shadowrocket, etc.)
            </p>
        </div>
      </div>
    </div>
  );
};

export default ClientConfigOutput;
