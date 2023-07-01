#!/bin/sh
rsync --progress -ve ssh index.js pi@192.168.0.52:/mnt/logger/
ssh pi@192.168.0.52 sudo systemctl restart logger