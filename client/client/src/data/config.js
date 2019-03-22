const template =
 {
   "AssetName" : "Aseet_DEMO_0_Flow_Meter",
   "Equations" :
   [
     {
       "Name" : "LMTD",
       "Equation": "([DELTA_T_1] - [DELTA_T_2]) / log([DELTA_T_1] / [DELTA_T_2])",
       "Tag": "LMTD"
     },
     {
       "Name" : "Avg Shell Inlet",
       "Equation": "Avg([ShellInlet/Temperature,30]) + Avg([ShellOutlet/Temperature,30])",
       "Tag": "AVG_SHELL_INLET"
     }
   ],
   "Devices":
   [
     {
       "Name": "Temperature Sensor 1",
       "SerialNumber": "02A050",
       "Tag": "ShellInlet",
       "Parameters": ["Temperature"]
     },
     {
       "Name": "Temperature Sensor 2",
       "SerialNumber": "02A051",
       "Tag": "ShellInlet",
       "Parameters": ["Temperature"]
     },
     {
       "Name": "Temperature Sensor 5",
       "SerialNumber": "02A054",
       "Tag": "ShellOutlet",
       "Parameters": ["Temperature"]
     },
     {
       "Name": "Temperature Sensor 6",
       "SerialNumber": "02A055",
       "Tag": "ShellOutlet",
       "Parameters": ["Temperature"]
     }
   ]
 }

export default template;
