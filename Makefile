setup :
	cd serialport_native;node-waf configure build;cd ..;
	cp serialport_native/build/default/serialport_native.node .
