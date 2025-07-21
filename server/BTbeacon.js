import HciSocket from 'hci-socket';
import NodeBleHost from 'ble-host';
const BleManager = NodeBleHost.BleManager;
const AdvertisingDataBuilder = NodeBleHost.AdvertisingDataBuilder;
const HciErrors = NodeBleHost.HciErrors;
const AttErrors = NodeBleHost.AttErrors;

const dID='X4Y3'
const deviceName = 'STRM'+dID;

var transport = new HciSocket(); // connects to the first hci device on the computer, for example hci0

var options = {
    // optional properties go here
};

BleManager.create(transport, options, function(err, manager) {
    // err is either null or an Error object
    // if err is null, manager contains a fully initialized BleManager object
    if (err) {
        console.error(err);
        return;
    }
    
    var notificationCharacteristic;
    
    manager.gattDb.setDeviceName(deviceName);
    manager.gattDb.addServices([
        {
            uuid: '22222222-3333-4444-5555-666666666666',
            characteristics: [
                {
                    uuid: '22222222-3333-4444-5555-666666666668',
                    properties: ['read'],
                    onRead: function(connection, callback) {
                        callback(AttErrors.SUCCESS, new Date().toString());
                    },
                    value: "XX47"
                },
                {
                    uuid: '22222222-3333-4444-5555-666666666660',
                    properties: ['write'],
                    onWrite: function(connection, needsResponse, value, callback) {
                        console.log('TAG ZAMELDOWAŁ SIĘ! TAGID: '+value);
                        callback(AttErrors.SUCCESS); // actually only needs to be called when needsResponse is true
                    }
                },
                {
                    uuid: '22222222-3333-4444-5555-666666666669',
                    properties: ['write'],
                    onWrite: function(connection, needsResponse, value, callback) {
                        const Voltage=value/4095.0*5.8;
                        console.log('Voltage:'+Voltage+"V");
                        callback(AttErrors.SUCCESS); // actually only needs to be called when needsResponse is true
                    }
                },
                /*notificationCharacteristic = {
                    uuid: '22222222-3333-4444-5555-66666666666A',
                    properties: ['notify'],
                    onSubscriptionChange: function(connection, notification, indication, isWrite) {
                        if (notification) {
                            // Notifications are now enabled, so let's send something
                            notificationCharacteristic.notify(connection, 'Sample notification');
                        }
                    }
                }*/
            ]
        }
    ]);
    
    const advDataBuffer = new AdvertisingDataBuilder()
                            .addFlags(['leGeneralDiscoverableMode', 'brEdrNotSupported'])
                            .addLocalName(/*isComplete*/ true, deviceName)
                            .add128BitServiceUUIDs(/*isComplete*/ true, ['22222222-3333-4444-5555-666666666666'])
                            .build();
    manager.setAdvertisingData(advDataBuffer);
    // call manager.setScanResponseData(...) if scan response data is desired too
    startAdv();

    function startAdv() {
        manager.startAdvertising({/*options*/}, connectCallback);
    }
    
    function connectCallback(status, conn) {
        if (status != HciErrors.SUCCESS) {
            // Advertising could not be started for some controller-specific reason, try again after 10 seconds
            setTimeout(startAdv, 10000);
            return;
        }
        conn.on('disconnect', startAdv); // restart advertising after disconnect
        console.log('Connection established!', conn);
    }
});