'use client';

import React, { useState, useEffect } from 'react';
// import Image from "next/image"; // Not actively used in the main layout for now
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from '@/contexts/LanguageContext';
import { logAnalyticsEvent } from '@/utils/analytics';

import AuthForm from "@/components/AuthForm";
import ServerConfigForm, { ServerConfigData } from "@/components/ServerConfigForm";
import IpScanner from "@/components/IpScanner";
import ConnectionTester from "@/components/ConnectionTester";
import ClientConfigOutput from "@/components/ClientConfigOutput";
import DeploymentScriptDownloader from "@/components/DeploymentScriptDownloader";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { generateXrayServerConfigJson } from "@/utils/configGenerators";

export default function Home() {
  const { currentUser, loading: authLoading, isGuest, signInAsGuest, signOut } = useAuth();
  const { locale, t } = useLanguage();

  const [selectedIp, setSelectedIp] = useState<string>('');
  const [currentServerConfig, setCurrentServerConfig] = useState<ServerConfigData | null>(null);

  // Log app_opened event once on initial load
  useEffect(() => {
    // Wait for auth and language to be ready before logging to ensure correct user/locale info
    if (!authLoading) { // Assuming authLoading indicates initial onAuthStateChanged has run
        logAnalyticsEvent('app_opened', currentUser, locale);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]); // currentUser and locale are captured by the logAnalyticsEvent function call itself

  const handleGuestSignIn = () => {
    signInAsGuest();
    logAnalyticsEvent('guest_session_started', null, locale);
  }

  const handleSniChange = (newSni: string) => {
    // This function is primarily for IpScanner to know the current SNI from ServerConfigForm
    // ServerConfigForm itself updates the main currentServerConfig state via onConfigUpdate
    if (currentServerConfig && newSni !== currentServerConfig.sni) {
        setCurrentServerConfig(prev => prev ? { ...prev, sni: newSni } : null);
    } else if (!currentServerConfig && newSni) {
        // If there's no server config yet, but SNI changes (e.g. from a default in ServerConfigForm)
        // we can update a temporary SNI or let onConfigUpdate handle it.
        // For now, ServerConfigForm's onConfigUpdate should provide the initial SNI.
    }
  };

  const handleIpSelect = (ip: string) => {
    setSelectedIp(ip);
    if (currentServerConfig) {
        logAnalyticsEvent('ip_selected_from_scan', currentUser, locale, { ip, currentSni: currentServerConfig.sni });
    }
  };

  const handleServerConfigUpdate = (config: ServerConfigData) => {
    setCurrentServerConfig(config);
  };

  const handleDownloadServerConfigJson = (configData: ServerConfigData) => {
    if (!configData) return;
    const xrayConfigObject = generateXrayServerConfigJson(configData);
    const blob = new Blob([JSON.stringify(xrayConfigObject, null, 2)], { type: 'application/json' });

    // Using file-saver that was installed earlier
    // import { saveAs } from 'file-saver'; // Should be at top of file
    // saveAs(blob, 'config.json');
    // For now, using traditional method if saveAs isn't imported yet at top level
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAnalyticsEvent('server_config_generated', currentUser, locale, { sni: configData.sni, port: configData.port });
  };

  // Initial loading state for auth
  if (authLoading && !currentUser && !isGuest) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>{t('loading', 'common')}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 pt-20 md:pt-24">
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
        <LanguageSwitcher />
        {!currentUser && !isGuest && (
          <button
            onClick={handleGuestSignIn}
            className="px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            {t('signInAsGuest', 'common')}
          </button>
        )}
        {(currentUser || isGuest) && (
          <button
            onClick={signOut} // signOut in AuthContext already handles analytics for 'user_signed_out' if we add it there
            className="px-4 py-2 border rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            {t('signOut', 'common')}
          </button>
        )}
      </div>

      <div className="my-8 text-center w-full">
        <h1 className="text-3xl md:text-5xl font-bold">{t('realityBuilder', 'common')}</h1>
        <p className="mt-2 text-lg md:text-xl text-gray-600 dark:text-gray-300">
          {t('tagline', 'common')}
        </p>
      </div>

      {!currentUser && !isGuest && (
        <div className="w-full max-w-md mt-8">
          <AuthForm />
        </div>
      )}

      {(currentUser || isGuest) && (
        <div className="w-full flex flex-col items-center space-y-8 px-2">
          <div className="my-4 text-center">
            {currentUser && !currentUser.isAnonymous && <p>{t('loggedInAs', 'common', { email: currentUser.email })}</p>}
            {isGuest && <p>{t('guestMode', 'common')}</p>}
          </div>

          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Config Forms & Outputs */}
            <div className="space-y-8">
              <ServerConfigForm
                selectedIp={selectedIp}
                onSniChange={handleSniChange}
                onConfigUpdate={handleServerConfigUpdate}
              />
              {currentServerConfig && (
                <ClientConfigOutput
                  config={currentServerConfig}
                  onDownloadServerConfig={handleDownloadServerConfigJson}
                />
              )}
            </div>

            {/* Right Column: Tools & Info */}
            <div className="space-y-8">
              <IpScanner
                onIpSelect={handleIpSelect}
                currentSni={currentServerConfig?.sni || 'cloudflare.com'}
              />
              {currentServerConfig && (
                <ConnectionTester
                  vpsIp={currentServerConfig.vpsIp}
                  port={currentServerConfig.port}
                  uuid={currentServerConfig.uuid}
                  publicKey={currentServerConfig.publicKey}
                  sni={currentServerConfig.sni}
                />
              )}
              <DeploymentScriptDownloader />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
