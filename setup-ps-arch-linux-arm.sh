#!/usr/bin/env bash

ssh alarm@192.168.1.193
su # login as root, password: root

# Package manager
pacman -Syu # update everything
pacman -S git nodejs # pacman -S <packages>: install packages

# Ctrl + D to exit SSH

# Copy files from computer to remote
scp -r /Users/quanyails/code/Pokemon-Showdown alarm@192.168.1.193:$pwd
# You should be back SSH'd

# Run Pokemon Showdown server
cd Pokemon-Showdown
node pokemon-showdown

# Keep server running in background
kill -TSTP [pid] # Ctrl + Z (suspend)
bg && detach # https://askubuntu.com/a/381836

# Ctrl + D to exit SSH
# Ctrl + C to exit login
