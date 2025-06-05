#!/bin/bash
echo "====== Backend auto pulling ======"
cd /home/master/myapp/backend
git fetch --all
git reset --hard origin/master
echo "✅ Backend code pulled. Hãy restart bằng tay: yarn start"
