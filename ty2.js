
// 导入tuya对象
const tuya = require('zigbee-herdsman-converters/lib/tuya');
// 导入exposes对象
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const fz = {...require('zigbee-herdsman-converters/converters/fromZigbee'), legacy: require('zigbee-herdsman-converters/lib/legacy').fromZigbee};
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const ota = require('zigbee-herdsman-converters/lib/ota');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;
const utils = require('zigbee-herdsman-converters/lib/utils');

// 导出tuyaDevice对象
module.exports = {
    tuyaDevice: {
        // dataPoints属性改为数组
        dataPoints: [
            // 每个数据点添加name和type属性
            {name: 'presence_state', type: 'bool', dp: 1},
            {name: 'light_sensor', type: 'value', dp: 101},
            {name: 'minor_motion_switch', type: 'bool', dp: 110},
            {name: 'sensitivity', type: 'enum', dp: 2, range: [1,5]}, // 添加range属性
            {name: 'breathing_switch', type: 'bool', dp: 111},
            {name: 'LED_indicate', type: 'bool', dp: 107},
            {name: 'holdtime', type: 'value', dp: 106}
        ],
    },
};

// 导入tuyaLocal对象
const tuyaLocal = require('./tuyaDevice').tuyaDevice;

// 导出fzLocal对象
module.exports = {
    fzLocal: {
        // tuya_radar_sensor属性改为函数
        tuya_radar_sensor: (model, msg, publish, options, meta) => {
            const dpValue = tuya.firstDpValue(msg, meta, 'tuya_radar_sensor');
            const dp = dpValue.dp;
            const value = tuya.getDataValue(dpValue);
            // result变量改为空对象
            let result = {};
            switch (dp) {
            case tuyaLocal.dataPoints.presence_state:
                result = {'presence': {0: false, 1: true}[value]};
                break;
            case tuyaLocal.dataPoints.light_sensor:
                result = {'light_sensor': value};
                break;
            case tuyaLocal.dataPoints.minor_motion_switch:
                result = {'minor_motion_switch': value};
                break;
            case tuyaLocal.dataPoints.sensitivity:
                result = {'sensitivity': value};
                break;
            case tuyaLocal.dataPoints.breathing_switch:
                result = {'breathing_switch': value};
                break;
            case tuyaLocal.dataPoints.LED_indicate:
                result = {'LED_indicate': value};
                break;
            case tuyaLocal.dataPoints.holdtime:
                result = {'holdtime': value};
                break;
            // 添加default分支
            default:
                meta.logger.error(`fzLocal tuya_radar_sensor: unknown dp ${dp}, data ${JSON.stringify(msg.data)}`);
            }
            return result;
        },
    },
};



module.exports = {
    tzLocal: {
        // tuya_radar_sensor属性改为对象
        tuya_radar_sensor: {
            // key属性改为数组
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
        // convertSet属性改为函数
        convertSet: async (entity, key, value, meta) => {
            switch (key) {
            case 'range':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsMaxRange, value*100);
                break;
            case 'sensitivity':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsSensitivity, value);
                break;
            case 'presence_timeout':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsTimeout, value);
                break;
            case 'switch_state':
                await tuya.sendDataPointBool(entity, tuyaLocal.dataPoints.trsRelayState, value);
                break;
            case 'switch_mode':
                await tuya.sendDataPointEnum(entity, tuyaLocal.dataPoints.trsRelayMode, value);
                break;
            case 'block_time':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsBlockTime, value);
                break;
            case 'led_indicator':
                await tuya.sendDataPointBool(entity, tuyaLocal.dataPoints.trsLedEnabled, value);
                break;
            case 'unoccupied_sensitivity':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsUSensitivity, value);
                break;
            case 'illuminance_thershold':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsIlluminanceThld, value);
                break;
            // 添加default分支
            default: // Unknown Key
                meta.logger.info(`tzLocal tuya_radar_sensor: Unhandled key ${key}`);
            }
        },
    },
};


// 第四部分
// 导出tzLocal对象
module.exports = {
    tzLocal: {
        // tuya_radar_sensor属性改为对象
        tuya_radar_sensor: {
            // key属性改为数组
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
        // convertSet属性改为函数
        convertSet: async (entity, key, value, meta) => {
            switch (key) {
            case 'range':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsMaxRange, value*100);
                break;
            case 'sensitivity':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsSensitivity, value);
                break;
            case 'presence_timeout':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsTimeout, value);
                break;
            case 'switch_state':
                await tuya.sendDataPointBool(entity, tuyaLocal.dataPoints.trsRelayState, value);
                break;
            case 'switch_mode':
                await tuya.sendDataPointEnum(entity, tuyaLocal.dataPoints.trsRelayMode, value);
                break;
            case 'block_time':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsBlockTime, value);
                break;
            case 'led_indicator':
                await tuya.sendDataPointBool(entity, tuyaLocal.dataPoints.trsLedEnabled, value);
                break;
            case 'unoccupied_sensitivity':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsUSensitivity, value);
                break;
            case 'illuminance_thershold':
                await tuya.sendDataPointValue(entity, tuyaLocal.dataPoints.trsIlluminanceThld, value);
                break;
            // 添加default分支
            default: // Unknown Key
                meta.logger.info(`tzLocal tuya_radar_sensor: Unhandled key ${key}`);
            }
        },
    },
};

// 第六部分
// 不需要再次导入tzLocal对象，直接使用它
const definition = {
    fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_ynuidkkp'}],
    // model属性改为唯一字符串
    model: 'TS0601_radar_sensor',
    vendor: 'TuYa',
    description: 'Human presence sensor',
    fromZigbee: [fzLocal.tuya_radar_sensor],
    toZigbee: [tzLocal.tuya_radar_sensor],
    onEvent: tuya.onEventSetLocalTime,
    configure: tuya.configureMagicPacket,
    exposes: [
        e.presence().withAccess(ea.STATE), // 添加withAccess方法
        e.illuminance_lux().withUnit('Lux').withValueMin(0).withValueMax(13000).withValueStep(1).withAccess(ea.STATE),
        e.switch().withDescription('Minor motion switch').withAccess(ea.STATE),
        exposes.numeric('sensitivity', ea.STATE_SET).withValueMin(0).withValueMax(100).withValueStep(10).withDescription('sensitivity of the radar'),
        e.switch().withDescription('Breathing switch').withAccess(ea.STATE),
        e.switch().withDescription('LED indicator').withAccess(ea.STATE),
        exposes.enum('holdtime', ea.STATE_SET).withValues(['30', '60', '120', '180', '300', '600', '1200', '1800']).withDescription('Hold time') // 添加withValues方法
    ],
    meta: {
        // tuyaDatapoints属性改为数组
        tuyaDatapoints: [
            {type: tuya.dataPoints.state, name: 'presence_state'},
            {type: tuya.dataPoints.value, name: 'light_sensor'},
            {type: tuya.dataPoints.bool, name: 'minor_motion_switch'},
            {type: tuya.dataPoints.value, name: 'sensitivity'},
            {type: tuya.dataPoints.bool, name: 'breathing_switch'},
            {type: tuya.dataPoints.bool, name: 'LED_indicate'},
            {type: tuya.dataPoints.enum, name: 'holdtime'}
        ],
    },
};
module.exports = definition; 

