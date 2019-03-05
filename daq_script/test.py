import socket
import time
import json
from bluepy import btle

SERVICE_UUID = '00004754-1212-efde-1523-785fef13d123'
READ_UUID = '00004755-1212-efde-1523-785fef13d123'
WRITE_UUID = '00004756-1212-efde-1523-785fef13d123'

global data1
global rev_data
global got_data
rev_data = []
got_data = 0
data1 = 0

def internet(host="8.8.8.8", port=53, timeout=3):
   """
   Host: 8.8.8.8 (google-public-dns-a.google.com)
   OpenPort: 53/tcp
   Service: domain (DNS/TCP)
   """
   try:
     socket.setdefaulttimeout(timeout)
     socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
     return True
   except Exception as ex:
     print(ex.message)
     return False

class CMDelegate(btle.DefaultDelegate):
	def __init__(self, handle):
		btle.DefaultDelegate.__init__(self)
		self.handle = handle

	def handleNotification(self, cHandle, data):
		if (self.handle == cHandle):
			print(data)
			
def SendCmdWithResponse():
	rev_data = []
	got_data = 0
	ch_write[0].write(b'\xdb\x24')
	print(got_data)

	while cm_p.waitForNotifications(1):
		print(data1)
	while got_data == 0:
		time.sleep(1)
		
	return rev_data


with open('daq_config.json') as data_file:
	config_data = json.load(data_file)

local_end_point = config_data['LocalEndPoint']
cloud_end_point = config_data['CloudEndPoint']
core_modules = config_data['CoreModules']

for single_cm in core_modules:
	devices = single_cm['Devices']
	mac_address = single_cm['MacAddress']
	print(mac_address)
	global cm_p
	cm_p = btle.Peripheral()


	try:
		print("connecting")
		cm_p.connect(mac_address, btle.ADDR_TYPE_RANDOM)
	except btle.BTLEException as ex:
		print("Unable to connect to device {}".format(mac_address))
		break

	print("connted to device {}".format(mac_address))
	svc = cm_p.getServiceByUUID(SERVICE_UUID)
	ch_read = svc.getCharacteristics(READ_UUID)
	global ch_write
	ch_write = svc.getCharacteristics(WRITE_UUID)

	if len(ch_read) == 1 and len(ch_write) == 1:
	# enable notification
		noti_handle = ch_read[0].getHandle() + 1

		cm_p.withDelegate(CMDelegate(ch_read[0].getHandle()))

		cm_p.writeCharacteristic(noti_handle, (1).to_bytes(2, byteorder='little'))

		# cm_p.waitForNotifications(5)
		
		print(cm_p.delegate.__dict__)
		while True:
			ch_write[0].write(b'\xdb\x24')
			# data = SendCmdWithResponse()
			
			print("wait")
			while cm_p.waitForNotifications(1):
				continue
				
			print(data1)
			time.sleep(5)