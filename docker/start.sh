#!/bin/bash
set -m
printf "%s\n" "" "/=======================================\\" "|   Launching Tests & Server & Client   |"           "\=======================================/"
cd /home/app/
yarn test
yarn dev &
cd ./mys3-client/
yarn dev:serve
