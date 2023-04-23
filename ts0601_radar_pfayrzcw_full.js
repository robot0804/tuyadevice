const exposes = require('zigbee-herdsman-converters/lib/exposes');
const fz = {...require('zigbee-herdsman-converters/converters/fromZigbee'), legacy: require('zigbee-herdsman-converters/lib/legacy').fromZigbee};
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const ota = require('zigbee-herdsman-converters/lib/ota');
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;
const utils = require('zigbee-herdsman-converters/lib/utils');

const tuyaLocal = {
    dataPoints: {
        trsPresenceState: 1,
        trsSensitivity: 2,
        trsMinRange: 3,
        trsMaxRange: 4,
        trsBits: 6,
        trsObjectDistance: 9,
        trsDelay: 101,
        trsTimeout: 102,
        trsIlluminanceLux: 104,
        trsUSensitivity: 105,
        trsURangeReduce: 106,
        trsRelayMode: 107,
        trsRelayState: 108,
        trsLedEnabled: 109,
        trsIlluminanceThld: 110,
		trsRelayPolarity: 111,
		trsBlockTime: 112,
		trsConfResult: 113,
		trsSensorControl: 115,
    },
};

const fzLocal = {
    tuya_radar_sensor: {
        cluster: 'manuSpecificTuya',
        type: ['commandDataResponse', 'commandDataReport'],
        convert: (model, msg, publish, options, meta) => {
            const dpValue = tuya.firstDpValue(msg, meta, 'tuya_radar_sensor');
            const dp = dpValue.dp;
            const value = tuya.getDataValue(dpValue);
            let result = null;
            switch (dp) {
            case tuyaLocal.dataPoints.trsPresenceState:
                result = {'presence': {0: false, 1: true}[value]};
                break;
            case tuyaLocal.dataPoints.trsObjectDistance:
                result = {'distance': value/100};
                break;
            case tuyaLocal.dataPoints.trsSensitivity:
                result = {'sensitivity': value};
                break;
            case tuyaLocal.dataPoints.trsIlluminanceLux:
                result = {'illuminance_lux': value/10};
                break;
            case tuyaLocal.dataPoints.trsDelay:
                result = {'delay': value/100};
                break;
            case tuyaLocal.dataPoints.trsTimeout:
                result = {'presence_timeout': value};
                break;
            case tuyaLocal.dataPoints.trsBits:
                result = {'self_test': {0: "Pending", 1: "Pass", 2: "Fail", 3:"Other", 4:"Comm Error", 5:"Radar Error"}[value]};
                break;
            case tuyaLocal.dataPoints.trsMaxRange:
                result = {'range': value/100};
                break;
            case tuyaLocal.dataPoints.trsMinRange:
                result = {'min_range': value/100};
                break;
            case tuyaLocal.dataPoints.trsUSensitivity:
                result = {'unoccupied_sensitivity': value};
                break;
            case tuyaLocal.dataPoints.trsURangeReduce:
                result = {'range_reduce': value/100};
                break;
            case tuyaLocal.dataPoints.trsRelayMode:
                result = {'switch_mode': {0: 'Normal', 1:'Local', 2:'Manual',3:'Unavailable'}[value]};
                break;
            case tuyaLocal.dataPoints.trsRelayState:
                result = {'switch_state': {0: "OFF", 1: "ON"}[value]};
                break;
            case tuyaLocal.dataPoints.trsLedEnabled:
                result = {'led_indicator': {0: 'DISABLE', 1: 'ENABLE'}[value]};
                break;
            case tuyaLocal.dataPoints.trsIlluminanceThld:
                result = {'illuminance_thershold': value/10};
                break;
            case tuyaLocal.dataPoints.trsRelayPolarity:
                result = {'relay_polarity': {0: "NO", 1: "NC"}[value]};
                break;
            case tuyaLocal.dataPoints.trsBlockTime:
                result = {'block_time': value/10};
                break;
            case tuyaLocal.dataPoints.trsConfResult:
                result = {'config_result': value};
                break;
            case tuyaLocal.dataPoints.trsSensorControl:
                result = {'sensor_control': {0: "on", 1: "off", 2:"foced_occupy",3:"forced_unoccupy"}[value]};
                break;				
            default:
                meta.logger.error(`fzLocal leapmmw_radar_sensor: unknown dp ${dp}, data ${JSON.stringify(msg.data)}`);
            }
            return result;
        },
    },
};

const tzLocal = {
    tuya_radar_sensor: {
        key: ['range', 
		'sensitivity', 
		'presence_timeout',
		'switch_state',
		'switch_mode',
		'block_time',
		'led_indicator',
		'unoccupied_sensitivity',
		'illuminance_thershold'
		],
        convertSet: async (entity, key, value, meta) => {
            switch (key) {
            case 'range':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsMaxRange, value*100);
                break;
            case 'min_range':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsMinRange, value*100);
                break;
            case 'range_reduce':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsURangeReduce, value*100);
                break;
            case 'sensitivity':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsSensitivity, value);
                break;
            case 'unoccupied_sensitivity':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsUSensitivity, value);
                break;
            case 'presence_timeout':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsTimeout, value);
                break;
            case 'switch_state':
                await tuya.sendDataPointEnum(entity, tuyaLocal.dataPoints.trsRelayState, ['OFF','ON'].indexOf(value));
                break;
            case 'switch_mode':
                await tuya.sendDataPointEnum(entity, tuyaLocal.dataPoints.trsRelayMode, ['Normal', 'Local', 'Manual','Unavailable'].indexOf(value));
                break;
			case 'block_time':
				await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsBlockTime, value*10);
				break;
			case 'led_indicator':
                await tuya.sendDataPointEnum(entity, tuyaLocal.dataPoints.trsLedEnabled, ['DISABLE','ENABLE'].indexOf(value));
				break;
			case 'illuminance_thershold':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsIlluminanceThld, value*10);
				break;
            default: // Unknown Key
                meta.logger.info(`tzLocal leapmmw_radar_sensor: Unhandled key ${key}`);
            }
        },
    },
};

const definition = {
    fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_pfayrzcw'},
				{modelID: 'TS0601', manufacturerName: '_TZE200_z4tzr0rg'},
				{modelID: 'TS0601', manufacturerName: '_TZE200_pbqm8lej'},
				{modelID: 'TS0601', manufacturerName: '_TZE200_xnaqu2pc'},
				{modelID: 'TS0601', manufacturerName: '_TZE200_wk7seszg'}],
    model: 'MTG035-ZB',
    vendor: 'LeapMMW',
    description: 'Human presence sensor',
    fromZigbee: [fzLocal.tuya_radar_sensor],
    toZigbee: [tzLocal.tuya_radar_sensor],
    onEvent: tuya.onEventSetLocalTime,
    exposes: [
		e.presence(), 
        e.illuminance_lux(), 
        exposes.numeric('distance', ea.STATE).withValueMin(0).withValueMax(10).withDescription('target distance').withValueStep(0.1).withUnit('m'),
        exposes.numeric('range', ea.SET).withValueMin(1.5).withValueMax(10).withDescription('Maximum detection range').withValueStep(0.1).withUnit('m'),
        exposes.numeric('min_range', ea.SET).withValueMin(1.5).withValueMax(10).withDescription('Minimum detection range').withValueStep(0.1).withUnit('m'),
		exposes.enum('switch_state', ea.STATE_SET, ["OFF", "ON"]).withDescription('On/off state of the switch'),
		exposes.enum('switch_mode', ea.STATE_SET, ['Normal', 'Local', 'Manual','Unavailable']).withDescription('Control source of switch'),
		exposes.options.presence_timeout().withValueMax(1500).withValueMin(5).withValueStep(1),
        exposes.numeric('sensitivity', ea.STATE_SET).withValueMin(0).withValueMax(9).withValueStep(1).withDescription('sensitivity of the radar'),
        exposes.numeric('unoccupied_sensitivity', ea.STATE_SET).withValueMin(0).withValueMax(9).withValueStep(1),
        exposes.numeric('range_reduce', ea.STATE_SET).withValueMin(0).withValueMax(10).withValueStep(0.6),
        exposes.numeric('block_time', ea.STATE_SET).withValueMin(0).withValueMax(60).withValueStep(0.1),
		exposes.enum('self_test', ea.STATE, ["Pending", "Pass", "Fail", "Other", "Comm Error", "Radar Error"]).withDescription('Self-test result'),
		exposes.enum('led_indicator', ea.STATE_SET, ["DISABLE", "ENABLE"]).withDescription('working status indicator contorl'),	
		exposes.numeric('illuminance_thershold', ea.STATE_SET).withValueMin(0).withValueMax(420).withValueStep(0.1),
    ],
};

module.exports = definition;