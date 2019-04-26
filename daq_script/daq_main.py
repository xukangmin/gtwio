import socket
import time
import json
from bluepy import btle
import struct
import urllib.request

SERVICE_UUID = '00004754-1212-efde-1523-785fef13d123'
READ_UUID = '00004755-1212-efde-1523-785fef13d123'
WRITE_UUID = '00004756-1212-efde-1523-785fef13d123'

CMD_READ_CURRENT_TIME               =   b'\xDB\x01'
CMD_WRITE_CURRENT_TIME              =   b'\xDB\x02'
CMD_READ_DAQ_INTERVAL               =   b'\xDB\x03'
CMD_UPDATE_DAQ_INTERVAL             =   b'\xDD\x04'
CMD_ADD_DAQ_SENSOR                  =   b'\xDB\x05'
CMD_RM_DAQ_SENSOR                   =   b'\xDB\x06'
CMD_GET_ALL_DAQ_SENSOR              =   b'\xDB\x07'
CMD_READ_BATTERY_VOLTAGE            =   b'\xDB\x08'
CMD_READ_DC_VOLTAGE                 =   b'\xDB\x09'
CMD_READ_DB_INFO                    =   b'\xDB\x10'
CMD_READ_SINGLE_DATA_BY_REC_NO      =   b'\xDB\x11'
CMD_READ_SINGLE_DATA_BY_TIMESTAMP   =   b'\xDB\x12'
CMD_READ_RECENT_DATA                =   b'\xDB\x13'
CMD_READ_BULK_DATA_BY_REC_NO        =   b'\xDB\x14'
CMD_READ_BULK_DATA_BY_TIMESTAMP     =   b'\xDB\x15'
CMD_TRUNCATE_DATA                   =   b'\xDB\x16'


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
        self.recv = []

    def handleNotification(self, cHandle, data):
        if (self.handle == cHandle):
            self.recv.append(data)

    def clear(self):
        self.recv = []

class CoreModule:
    def __init__(self, bt_address):
        self.addr = bt_address
        self.cm_p = btle.Peripheral()

    def cm_connect(self):
        try:
            print("connecting")
            self.cm_p.connect(self.addr, btle.ADDR_TYPE_RANDOM)
            print("connted to device {}".format(self.addr))
            self.svc = self.cm_p.getServiceByUUID(SERVICE_UUID)
            self.ch_read = self.svc.getCharacteristics(READ_UUID)
            self.ch_write = self.svc.getCharacteristics(WRITE_UUID)

            if len(self.ch_read) == 1 and len(self.ch_write) == 1:
            # enable notification
                noti_handle = self.ch_read[0].getHandle() + 1

                self.cm_p.withDelegate(CMDelegate(self.ch_read[0].getHandle()))

                self.cm_p.writeCharacteristic(noti_handle, (1).to_bytes(2, byteorder='little'))
            # enable notification
        except btle.BTLEException as ex:
            print("Unable to connect to device {}".format(self.addr))
            return False
        finally:
            return True

    def cm_disconnect(self):
        self.cm_p.disconnect()

    def SendCmdWithResponse(self, cmd):
        # ch_write[0].write(b'\xdb\x24')
        self.cm_p.delegate.clear()

        self.ch_write[0].write(cmd)

        while self.cm_p.waitForNotifications(2):
            continue

        return self.cm_p.delegate.recv

    def sync_time(self):
        data = self.SendCmdWithResponse(CMD_READ_CURRENT_TIME)
        
        if len(data) == 1 and len(data[0]) == 6:
            cm_ts = struct.unpack('<L',data[0][2:])[0]
            print("core module timestamp=" + str(cm_ts))
            ep_time = int(time.time())
            # if timestamp difference > 10 seconds, synchronize
            if abs(cm_ts - ep_time) > 10:
                new_ts_raw = struct.pack('<L', ep_time) # unsigned long https://docs.python.org/2/library/struct.html
                new_ts_cmd = CMD_WRITE_CURRENT_TIME + new_ts_raw
                ret = self.SendCmdWithResponse(new_ts_cmd)
                print("timestamp sync done")
    
    def sync_interval(self, daq_interval):
        ret = self.SendCmdWithResponse(CMD_READ_DAQ_INTERVAL)

        if len(ret) == 1 and len(ret[0]) == 4:
            cm_interval = struct.unpack('<H', ret[0][2:])[0] # unsigned short https://docs.python.org/2/library/struct.html
            if daq_interval != cm_interval:
                # write defined interva to cm
                daq_cmd = CMD_UPDATE_DAQ_INTERVAL + struct.pack('<H', daq_interval)
                ret = self.SendCmdWithResponse(daq_cmd)
                print("daq interval sync done")

    def sync_device(self, device_list):
        ret = self.SendCmdWithResponse(CMD_GET_ALL_DAQ_SENSOR)
        
        cm_device_list = []
        
        add_list = []

        rm_list = []

        if len(ret) > 1: # at least one device 
            for i in ret:
                if i[:2] != b'\xdb\x07':
                    cm_device_list.append(i[2:].decode())
        
        print("cm_list")
        print(cm_device_list)

        for d in device_list:
            if d not in cm_device_list:
                add_list.append(d)

        for d in cm_device_list:
            if d not in device_list:
                rm_list.append(d)

        print("add_list")
        print(add_list)
        print("*********")
        print("rm_list")
        print(rm_list)

        for d in add_list:
            add_cmd = CMD_ADD_DAQ_SENSOR + d.encode()
            ret = self.SendCmdWithResponse(add_cmd)

        for d in rm_list:
            rm_cmd = CMD_RM_DAQ_SENSOR + d.encode()
            ret = self.SendCmdWithResponse(rm_cmd)

    def sync_data(self, device_list, endpoint):
        req = endpoint + '/device/getDeviceBySerialNumber?SerialNumber=02A050'
        
        # req = 'http://www.python.org/'
        print(req)
        with urllib.request.urlopen(req,timeout=100) as f:
            buf = f.read(300).decode('utf-8')
            print("GET RESPONSE")
            print(buf)


with open('daq_config.json') as data_file:
    config_data = json.load(data_file)

local_end_point = config_data['LocalEndPoint']
cloud_end_point = config_data['CloudEndPoint']
core_modules = config_data['CoreModules']

for single_cm in core_modules:
    devices = single_cm['Devices']
    mac_address = single_cm['MacAddress']
    cm = CoreModule(mac_address)
    cm.cm_connect()
    # if internet():
        # sync time stamp
        # cm.sync_time()    
        
    # sync i

    # daq_interval = single_cm['Interval']

    # cm.sync_interval(daq_interval)

    # cm.sync_device(single_cm['Devices'])
    cm.sync_data(single_cm['Devices'], local_end_point)
    cm.cm_disconnect()
