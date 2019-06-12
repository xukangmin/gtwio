cp ./gtwio.service /lib/systemd/system/
cp ./gtwsync.service /lib/systemd/system/

systemctl enable gtwio.service
systemctl enable gtwsync.service
systemctl start gtwio.service
systemctl start gtwio.service
systemctl daemon-reload

