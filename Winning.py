import serial
import serial.tools.list_ports
import time
from firebase import firebase

FBConn = firebase.FirebaseApplication('https://sloth-35a82.firebaseio.com/', None) # variable with link to firebase

micro_bit_serial_ports = [ # array to contain active ports
    p.device
    for p in serial.tools.list_ports.comports()
    if 'micro:bit' in p.description #only ports contaning micro:bit will be included
]
if not micro_bit_serial_ports: #error handling
    raise IOError("No Micro Bit found")
if len(micro_bit_serial_ports) > 1:
    warnings.warn('Multiple Micro Bits found - using the first')


ser = serial.Serial()    #Create a serial port object
ser.baudrate = 115200    #Set the baud-rate to 115200 (make sure to use the same speed as the device you're connecting to!)
ser.port = micro_bit_serial_ports[0]        #Set the communications port
ser.open()               #Open the port

latestKey = 0
lastKey = 0

while True:              #Loop forever
    
    result = FBConn.get('/winner/', None)
    
    
    for keyID in result:
        latestWin = str(result[keyID]['won']) #we need to convert to string to make the serial port happy
        latestKey = keyID
        
    if latestKey != lastKey and lastKey != 0: #only write to seral if new keyId is in database
        
        ser.write(latestWin.encode('UTF-8') + b"\n")
    lastKey = latestKey
    time.sleep(0.5)
    
ser.close() #Close serial port
