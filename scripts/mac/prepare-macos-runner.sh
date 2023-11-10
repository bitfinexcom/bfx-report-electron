#!/usr/bin/env bash

# Turn uninterrupted testing on macOS

# Change Local name to avoid name clash causing alert
uniqueComputerName="${GITHUB_WORKFLOW:-"mac-e2e-test-runner"}-$RANDOM"
sudo scutil --set LocalHostName "$uniqueComputerName"
sudo scutil --set ComputerName "$uniqueComputerName"

# Close Notification window
sudo killall UserNotificationCenter || true

# Do not disturb
defaults -currentHost write com.apple.notificationcenterui doNotDisturb -boolean true
defaults -currentHost write com.apple.notificationcenterui doNotDisturbDate -date "`date -u +\"%Y-%m-%d %H:%M:%S +0000\"`"
sudo killall NotificationCenter

# Disable firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
sudo /usr/libexec/ApplicationFirewall/socketfilterfw -k

# Close Finder Windows using Apple Script
sudo osascript -e 'tell application "Finder" to close windows'
