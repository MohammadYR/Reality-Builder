'use client';

import React from 'react';

const DeploymentScriptDownloader: React.FC = () => {
  return (
    <div className="w-full max-w-lg p-6 mt-6 bg-white shadow-md rounded-lg dark:bg-neutral-800">
      <h2 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">
        3. Deployment Script
      </h2>
      <div className="space-y-2">
        <a
          href="/scripts/install.sh" // Path to the static script in the public folder
          download="install_xray_reality.sh" // Suggested filename for download
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download install.sh (Linux/Systemd Template)
        </a>
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          This is a template script. You'll need to:
        </p>
        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1 pl-4">
          <li>Review and customize it for your specific VPS environment.</li>
          <li>Ensure the downloaded server <code>config.json</code> (from Step 2) is placed at <code>/usr/local/etc/xray/config.json</code> on your server, or modify the script to fetch/include it.</li>
        </ul>
        <p className="text-xs text-orange-500 dark:text-orange-400 mt-2 text-center">
          Dynamic script generation with your specific configuration values will be available in a future update.
        </p>
      </div>
    </div>
  );
};

export default DeploymentScriptDownloader;
