# Pull code
cd /root/pulsepot-backend-droplet/
git checkout live_server
git pull origin live_server

# Build and deploy
npm install
pm2 restart server
