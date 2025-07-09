#!/bin/bash

# Reality Builder - Xray Installation Script (Placeholder)
# This script is a template. Review and customize it for your specific VPS environment.

# --- Configuration Variables (to be replaced by the app or user) ---
XRAY_CONFIG_JSON_URL="YOUR_CONFIG_JSON_DOWNLOAD_URL_HERE" # Or use a here-doc or scp
XRAY_INSTALL_PATH="/usr/local/etc/xray"
XRAY_BINARY_PATH="/usr/local/bin/xray"
SYSTEMD_SERVICE_NAME="xray"

# --- Helper Functions ---
print_message() {
  echo "-----------------------------------------------------"
  echo "$1"
  echo "-----------------------------------------------------"
}

check_root() {
  if [ "$(id -u)" -ne 0 ]; then
    print_message "This script must be run as root. Please use sudo."
    exit 1
  fi
}

# --- Main Script ---

# 0. Check for root privileges
check_root

# 1. Update and install prerequisites (e.g., curl, unzip)
print_message "Updating package list and installing prerequisites..."
if command -v apt-get &> /dev/null; then
  apt-get update && apt-get install -y curl unzip
elif command -v yum &> /dev/null; then
  yum install -y curl unzip
elif command -v dnf &> /dev/null; then
  dnf install -y curl unzip
else
  print_message "Unsupported package manager. Please install curl and unzip manually."
  # exit 1 # Or proceed with caution
fi

# 2. Download and Install Xray-core
# Using the official install script (recommended for keeping up-to-date)
print_message "Installing/Updating Xray-core using official script..."
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
# Check if XRAY_BINARY_PATH is now valid, the official script might install elsewhere
# For now, we assume it installs to a known location or is in PATH.

# If you prefer manual installation or a specific version:
# XRAY_VERSION="v1.8.0" # Example version
# ARCH=$(uname -m) # x86_64, aarch64, etc.
# Adjust based on your architecture, e.g., XRAY_ZIP="Xray-linux-64.zip" for x86_64
# print_message "Downloading Xray-core ${XRAY_VERSION}..."
# curl -L -o xray.zip "https://github.com/XTLS/Xray-core/releases/download/${XRAY_VERSION}/Xray-linux-64.zip"
# print_message "Installing Xray-core..."
# unzip xray.zip -d /usr/local/bin/
# mv /usr/local/bin/xray ${XRAY_BINARY_PATH} # Ensure it's at the expected path
# chmod +x ${XRAY_BINARY_PATH}
# rm xray.zip geoip.dat geosite.dat # Clean up

# 3. Create Xray configuration directory
print_message "Creating Xray configuration directory: ${XRAY_INSTALL_PATH}"
mkdir -p "${XRAY_INSTALL_PATH}"

# 4. Download server config.json
print_message "Downloading server configuration (config.json)..."
# Option A: Download from a URL (app needs to provide this URL if config is generated and stored)
# curl -L -o "${XRAY_INSTALL_PATH}/config.json" "${XRAY_CONFIG_JSON_URL}"

# Option B: If the config.json is bundled with this script or copied separately,
# ensure it's placed at ${XRAY_INSTALL_PATH}/config.json by the user or another process.
# For this script, we'll assume the user will place it there or the app will provide a way.
echo "{
  \"log\": { \"loglevel\": \"warning\" },
  \"inbounds\": [
    {
      \"port\": 443, \"protocol\": \"vless\",
      \"settings\": {
        \"clients\": [{ \"id\": \"YOUR_UUID_HERE\", \"flow\": \"xtls-rprx-vision\" }],
        \"decryption\": \"none\"
      },
      \"streamSettings\": {
        \"network\": \"tcp\", \"security\": \"reality\",
        \"realitySettings\": {
          \"show\": false, \"dest\": \"www.google.com:443\", \"xver\": 0,
          \"serverNames\": [\"www.google.com\"],
          \"privateKey\": \"YOUR_PRIVATE_KEY_HERE\",
          \"shortId\": \"YOUR_SHORT_ID_HERE\"
        }
      }
    }
  ],
  \"outbounds\": [
    { \"protocol\": \"freedom\", \"tag\": \"direct\" },
    { \"protocol\": \"blackhole\", \"tag\": \"blocked\" }
  ]
}" > "${XRAY_INSTALL_PATH}/config.json"
print_message "Placeholder config.json written to ${XRAY_INSTALL_PATH}/config.json"
print_message "IMPORTANT: Replace placeholders in config.json with your actual values (UUID, Private Key, SNI, Port etc.) if not using a dynamic URL."


# 5. Setup Systemd service for Xray
print_message "Setting up Systemd service: ${SYSTEMD_SERVICE_NAME}..."
cat > "/etc/systemd/system/${SYSTEMD_SERVICE_NAME}.service" <<EOL
[Unit]
Description=Xray Service
Documentation=https://github.com/xtls
After=network.target nss-lookup.target

[Service]
User=nobody
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
NoNewPrivileges=true
ExecStart=${XRAY_BINARY_PATH} run -config ${XRAY_INSTALL_PATH}/config.json
Restart=on-failure
RestartPreventExitStatus=23
LimitNPROC=10000
LimitNOFILE=1000000

[Install]
WantedBy=multi-user.target
EOL

# 6. Reload Systemd, enable and start Xray service
print_message "Reloading Systemd daemon, enabling and starting Xray service..."
systemctl daemon-reload
systemctl enable "${SYSTEMD_SERVICE_NAME}"
systemctl start "${SYSTEMD_SERVICE_NAME}"

# 7. Check Xray service status
print_message "Checking Xray service status..."
sleep 2 # Give it a moment to start
systemctl status "${SYSTEMD_SERVICE_NAME}" --no-pager

print_message "Xray installation and setup (attempted) complete."
print_message "Please verify the service status and check logs if necessary: journalctl -u ${SYSTEMD_SERVICE_NAME}"
echo "Ensure your firewall allows traffic on the configured port (e.g., 443/tcp)."

# --- End of Script ---
