from bluepy import btle
import time

class MyDelegate(btle.DefaultDelegate):
	def __init__(self, handle):
		btle.DefaultDelegate.__init__(self)
		self.handle = handle
		
	def handleNotification(self, cHandle, data):
		if (self.handle == cHandle):
			print(cHandle)
			print(data)


print("connecting")
p = btle.Peripheral( "CC:AB:F7:AA:8D:CC",btle.ADDR_TYPE_RANDOM)
print("connected")
p.setDelegate( MyDelegate(13) )

# Setup to turn notifications on, e.g.
svc = p.getServiceByUUID( '00004754-1212-efde-1523-785fef13d123' )
ch = svc.getCharacteristics( '00004755-1212-efde-1523-785fef13d123' )[0]
ch_w = svc.getCharacteristics( '00004756-1212-efde-1523-785fef13d123' )[0]

p.writeCharacteristic(ch.getHandle() + 1, (1).to_bytes(2, byteorder='little'))

ch_w.write(b'\xdb\x24')
# Main loop --------

while True:
	# if p.waitForNotifications(1.0):
		# handleNotification() was called
	#	continue
	print("Waiting...")
	ch_w.write(b'\xdb\x24')
	time.sleep(5)