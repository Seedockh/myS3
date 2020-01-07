#!/bin/bash
set -m
printf "%s\n" "" " ------------------------------------" "  |          Launching Server & Client         |" "  ------------------------------------"
cd /home/app/
yarn dev &
cd ./mys3-client/
yarn serve
