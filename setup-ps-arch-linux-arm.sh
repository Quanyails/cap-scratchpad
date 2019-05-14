#!/usr/bin/env bash

ssh alarm@192.168.1.193
su # login as root, password: root

# Package manager
pacman -Syu # update everything
pacman -S git nodejs npm # pacman -S <packages>: install packages

# Ctrl + D to exit SSH

# Copy files from computer to remote
## scp -r /Users/quanyails/code/Pokemon-Showdown alarm@192.168.1.193:$pwd
## ssh alarm@192.168.1.193 # again

# first time:
git clone https://github.com/Quanyails/Pokemon-Showdown.git Pokemon-Showdown
# subsequent times:
git pull origin master

# Run Pokemon Showdown server
cd Pokemon-Showdown
git checkout <branch-name>

# Keep server running in background
node pokemon-showdown & disown # https://askubuntu.com/a/870496

## Ctrl + Z (suspend)
## ps aux | grep pokemon-showdown # to get the PID
## kill -TSTP [pid]
## bg && detach # https://askubuntu.com/a/381836

# Ctrl + D to exit SSH
# Ctrl + C to exit login
