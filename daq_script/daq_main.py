import socket
import time
import json
from bluepy import btle
import struct
import urllib.request
import queue
import threading

SERVICE_UUID = '00004754-1212-efde-1523-785fef13d123'
READ_UUID = '00004755-1212-efde-1523-785fef13d123'
WRITE_UUID = '00004756-1212-efde-1523-785fef13d123'

CMD_LIST = []
CMD_LENGTH = [1] * 16  # 1 means 1 packet, 0 means depends

CMD_READ_CURRENT_TIME               =   0
CMD_WRITE_CURRENT_TIME              =   1
CMD_READ_DAQ_INTERVAL               =   2
CMD_UPDATE_DAQ_INTERVAL             =   3
CMD_ADD_DAQ_SENSOR                  =   4
CMD_RM_DAQ_SENSOR                   =   5
CMD_GET_ALL_DAQ_SENSOR              =   6
CMD_READ_BATTERY_VOLTAGE            =   7
CMD_READ_DC_VOLTAGE                 =   8
CMD_READ_DB_INFO                    =   9
CMD_READ_SINGLE_DATA_BY_REC_NO      =   10
CMD_READ_SINGLE_DATA_BY_TIMESTAMP   =   11
CMD_READ_RECENT_DATA                =   12
CMD_READ_BULK_DATA_BY_REC_NO        =   13
CMD_READ_BULK_DATA_BY_TIMESTAMP     =   14
CMD_TRUNCATE_DATA                   =   15

for i in range(1,17):
    CMD_LIST.append(b'\xDB' + bytes([i]))

CMD_LENGTH[CMD_GET_ALL_DAQ_SENSOR] = 0
CMD_LENGTH[CMD_READ_BULK_DATA_BY_REC_NO] = 0
CMD_LENGTH[CMD_READ_BULK_DATA_BY_TIMESTAMP] = 0

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
     print(ex)
     return False

class CMDelegate(btle.DefaultDelegate):
    def __init__(self, handle):
        btle.DefaultDelegate.__init__(self)
        self.handle = handle
        self.recv = []

    def handleNotification(self, cHandle, data):
        if (self.handle == cHandle):
            self.recv.append(data)

    def get_length(self):
        return len(self.recv)

    def clear(self):
        self.recv = []

class CoreModule:
    def __init__(self, bt_address):
        self.addr = bt_address
        self.cm_p = btle.Peripheral()

    def cm_connect(self):
        try:
            # print("connecting")
            self.cm_p.connect(self.addr, btle.ADDR_TYPE_RANDOM)
            # print("connted to device {}".format(self.addr))
            self.svc = self.cm_p.getServiceByUUID(SERVICE_UUID)
            self.ch_read = self.svc.getCharacteristics(READ_UUID)
            self.ch_write = self.svc.getCharacteristics(WRITE_UUID)

            if len(self.ch_read) == 1 and len(self.ch_write) == 1:
            # enable notification
                noti_handle = self.ch_read[0].getHandle() + 1

                self.cm_p.withDelegate(CMDelegate(self.ch_read[0].getHandle()))

                self.cm_p.writeCharacteristic(noti_handle, (1).to_bytes(2, byteorder='little'))
            # enable notification
            return True
        except btle.BTLEException as ex:
            print("Unable to connect to device {}".format(self.addr))
            return False

    def cm_disconnect(self):
        self.cm_p.disconnect()

    def SendCmdWithResponse(self, cmd_index, aux = b''):
        # ch_write[0].write(b'\xdb\x24')

        time_out_count = 0
        MAX_TIME_OUT_COUNT = 600
        expected_length = 99999
        self.cm_p.delegate.clear()

        self.ch_write[0].write(CMD_LIST[cmd_index] + aux)
        if CMD_LENGTH[cmd_index] == 1:
            while self.cm_p.waitForNotifications(30) and self.cm_p.delegate.get_length() < CMD_LENGTH[cmd_index]:
                continue
        elif CMD_LENGTH[cmd_index] == 0:
            while self.cm_p.waitForNotifications(30) and self.cm_p.delegate.get_length() < expected_length:
                expected_length = struct.unpack('<L', self.cm_p.delegate.recv[0][2:])[0]
                expected_length = expected_length + 1
                continue
        


        return self.cm_p.delegate.recv

    def sync_time(self):
        # print('sync time')
        data = self.SendCmdWithResponse(CMD_READ_CURRENT_TIME)
        
        if len(data) == 1 and len(data[0]) == 6:
            cm_ts = struct.unpack('<L',data[0][2:])[0]
            # print("core module timestamp=" + str(cm_ts))
            ep_time = int(time.time())
            # if timestamp difference > 10 seconds, synchronize
            if abs(cm_ts - ep_time) > 10:
                new_ts_raw = struct.pack('<L', ep_time) # unsigned long https://docs.python.org/2/library/struct.html
                ret = self.SendCmdWithResponse(CMD_WRITE_CURRENT_TIME, new_ts_raw)
                # print("timestamp sync done")
    
    def sync_interval(self, daq_interval):
        ret = self.SendCmdWithResponse(CMD_READ_DAQ_INTERVAL)

        if len(ret) == 1 and len(ret[0]) == 4:
            cm_interval = struct.unpack('<H', ret[0][2:])[0] # unsigned short https://docs.python.org/2/library/struct.html
            if daq_interval != cm_interval:
                # write defined interva to cm
                daq_cmd = CMD_UPDATE_DAQ_INTERVAL + struct.pack('<H', daq_interval)
                ret = self.SendCmdWithResponse(daq_cmd)
                # print("daq interval sync done")

    def sync_device(self, device_list):
        ret = self.SendCmdWithResponse(CMD_GET_ALL_DAQ_SENSOR)
        
        cm_device_list = []
        
        add_list = []

        rm_list = []

        isValid = True 

        if len(ret) > 1: # at least one device 
            for i in ret:
                if len(i) > 3:
                    if i[:2] != b'\xdb\x07':
                        if len(i) == i[2] + 3:
                            try:
                                cm_device_list.append(i[3:].decode())
                            except:
                                return

        # print(cm_device_list)

        for d in device_list:
            if d not in cm_device_list:
                add_list.append(d)

        # print(add_list)

        for d in cm_device_list:
            if d not in device_list:
                rm_list.append(d)

        # print(rm_list)

        for d in add_list:
            add_cmd = bytes([len(d)]) + d.encode()
            ret = self.SendCmdWithResponse(CMD_ADD_DAQ_SENSOR, add_cmd)

        for d in rm_list:
            rm_cmd = bytes([len(d)]) + d.encode()
            ret = self.SendCmdWithResponse(CMD_RM_DAQ_SENSOR, rm_cmd)

    def post_data(self, endpoint, single_post_data):
        push_params = json.dumps(single_post_data).encode('utf8')
        push_url = endpoint + '/data/addDataBySerialNumber'
        req = urllib.request.Request(push_url,data=push_params,headers={'content-type': 'application/json'})

        try:
            res = urllib.request.urlopen(req)
        except urllib.error.HTTPError as e:
            print('HTTPerror=' + str(e.code))
        except urllib.error.URLError as e:
            print('URLError=' + str(e.code))
        except Exception as ex:
            print("post_data_exception=" + str(ex))

    def sync_single_device(self, device_def, endpoint):
        
        req = endpoint + '/device/getDeviceBySerialNumber?SerialNumber=' + device_def['SerialNumber']
        # print(req)
        try:
            with urllib.request.urlopen(req,timeout=500) as f:
                buf = f.read().decode('utf-8')
        except:
            print('cannot get data from endpoint, skip')
            return

        device_info = json.loads(buf)

        if device_info['SerialNumber'] == device_def['SerialNumber']: # match request
            db_para = device_info['Parameters']

            for p in db_para:
                # sync each parameter
                db_ts = 0
                cm_ts = 0
                query_str = device_info['SerialNumber']
                if 'Channel' in p:
                    if p['Channel'] != 'N/A':
                        query_str += p['Channel']

                # print('query_string=' + str(query_str))

                db_ts = p['CurrentTimeStamp']
                db_ts = int(db_ts / 1000)

                # print("db_ts=" + str(db_ts))

                cm_cmd = bytes([len(query_str)]) + query_str.encode()

                ret = self.SendCmdWithResponse(CMD_READ_RECENT_DATA, cm_cmd)

                if len(ret) == 1 and len(ret[0]) == 14:
                    cm_ts = struct.unpack('<L',ret[0][6:10])[0]
                    # print('cm_ts=' + str(cm_ts))
            
                if db_ts < cm_ts:
                    # potential data for update, read data from core module
                    cm_cmd = bytes([len(query_str)]) + query_str.encode() + struct.pack('<L', db_ts + 1) + struct.pack('<L', cm_ts)
                    # print(cm_cmd.hex())
                    ret = self.SendCmdWithResponse(CMD_READ_BULK_DATA_BY_TIMESTAMP, cm_cmd)
                    # print('data_size=' + str(len(ret) - 1))
                    if len(ret) - 1 > 0:

                    # header_size = struct.unpack('<L',ret[0][2:])[0]
                    # print('header_size=' + str(header_size))
                    # if len(ret) - 1 == header_size: # check size if match
                        # print('size match')
                        for data in ret:
                            if len(data) == 12:
                                data_index = struct.unpack('<L', data[:4])[0]
                                data_ts = struct.unpack('<L', data[4:8])[0]
                                data_value = struct.unpack('<f', data[8:])[0]

                                data_ts = data_ts * 1000 # convert to ms since cloud all use ms format
                                if p['Type'] == "Temperature":
                                    data_value = data_value * 1.8 + 32 # convert from C to F

                                # print("index=" + str(data_index) + ",ts=" + str(data_ts) + ",value=" + str(data_value))
                                # push data to the cloud / local end point

                                ch_required = False
                                if 'Channel' in p:
                                    if p['Channel'] != 'N/A':
                                        ch_required = True

                                if ch_required:
                                    push_data = {"SerialNumber": device_info['SerialNumber'], "Value": data_value, "DataType": p['Type'], "TimeStamp": data_ts, "Channel": p['Channel']}
                                else:
                                    push_data = {"SerialNumber": device_info['SerialNumber'], "Value": data_value, "DataType": p['Type'], "TimeStamp": data_ts}
                                
                                # better to do synchronize pushing for consistancy
                                # print(push_data)
                                self.post_data(endpoint, push_data)
                            
        # except:
        #     print("no sensor found or other error")
        

    def sync_data(self, device_list, endpoint):
        # print(device_list)

        for d in device_list:
            # print(d)
            self.sync_single_device(d, endpoint)

def check_end_point_live(endpoint):

    check_url = endpoint + '/status/getCurrentStatus'
    req = urllib.request.Request(check_url)

    try:
        res = urllib.request.urlopen(req)
        return True
    except urllib.error.HTTPError as e:
        print('check_end_point_live, endpoint=' + str(endpoint) + ',HTTPerror=' + str(e))
        return False
    except urllib.error.URLError as e:
        print('check_end_point_live, endpoint=' + str(endpoint) + ',URLError=' + str(e))
        return False
    except Exception as ex:
        print(ex)
        return False
    # with urllib.request.urlopen(req,timeout=500) as f:
    #     buf = f.read().decode('utf-8')


def build_query_list(device_data):

    query_list = []
    for d in device_data:
        sn = d['SerialNumber']
        for c in d['Data']:
            if 'Channel' in c:
                query_list.append(sn + c['Channel'])
            else:
                query_list.append(sn)

    return query_list

with open('daq_config.json') as data_file:
    config_data = json.load(data_file)

local_end_point = config_data['LocalEndPoint']
cloud_end_point = config_data['CloudEndPoint']
core_modules = config_data['CoreModules']

sync_cm_count = 0

while True:
    sync_cm_count = sync_cm_count + 1
    for single_cm in core_modules:
        devices = single_cm['Devices']
        query_list = build_query_list(devices)
        mac_address = single_cm['MacAddress']

        cm = CoreModule(mac_address)

        if cm.cm_connect():
            if sync_cm_count == 180:
                sync_cm_count = 0
                if internet():
                    # sync time stamp
                    cm.sync_time()    
                    
                # sync interval

                daq_interval = single_cm['Interval']

                cm.sync_interval(daq_interval)

                cm.sync_device(query_list)

            if check_end_point_live(local_end_point):
                cm.sync_data(devices, local_end_point)
            elif internet() and check_end_point_live(cloud_end_point):
                cm.sync_data(devices, cloud_end_point)
            cm.cm_disconnect()

        
        # print("core module done: " + str(mac_address))
    time.sleep(20)


