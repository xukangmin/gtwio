def connect():
	try:
		a = 1 / 0
		return True
	except:
		return False

print(connect())

