const axios = require('axios');
const BASE_URL = 'http://server.growatt.com';


export interface GrowattDevice {
  id: string;
  plantId: string;
  plantName: string;
  alias: string;
  type: string;
}

export interface GrowattPlant {
  id: string;
  plantName: string;
}

interface FetchData {
  username: string;
  password: string;
  type: string;
  id: string;
  plantId: string
}

export class GrowattAPI {
  username: string = '';
  password: string = '';
  request: any;

  constructor() {
    this.request = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  async login(username: string, password: string): Promise<boolean> {
    this.username = username;
    this.password = password;

    if (!this.username || !this.password) {
      throw new Error('Email and password required to login!');
    }

    const credentials = `account=${this.username}&password=${this.password}&lang=en`;

    const logged = (await this.request.post('/login', credentials));
    this.request.defaults.headers.Cookie = logged.headers['set-cookie'].join(';');
    return logged.data.result === 1;
  }

  async getDevices(): Promise<GrowattDevice[]> {
    const plants = (await this.request.post('index/getPlantListTitle')).data;
    let devices: GrowattDevice[] = [];
    for (const plant of plants) {
      devices = devices.concat(await this.getDevicesByPlant(plant));
    }
    return devices;
  }

  /*
    here we get deviceType = mix... and this is build only for storage...
  */
  async getDevicesByPlant(plant: GrowattPlant): Promise<GrowattDevice[]> {
    const devices: GrowattDevice[] = [];
    const response = (await this.request.post('panel/getDevicesByPlant', `plantId=${plant.id}`)).data;
    for (const deviceType in response.obj) {
      response.obj[deviceType].forEach((device: string[]) => devices.push({
        id: device[0],
        plantId: plant.id,
        plantName: plant.plantName,
        alias: device[1] || device[0],
        type: deviceType
      }));
    }
    return devices;
  }

  async fetch(data: FetchData) {
    await this.login(data.username, data.password);
    switch (data.type) {
      case 'storage':
        return this.fetchStorageData(data.id, data.plantId);
        break;
      case 'mix':
        return this.fetchMixData(data.id, data.plantId);
      default:
        throw new Error('Inverter type not supported yet!');
    }
  }

  async fetchStorageData(id: string, plantId: string) {
    const statusData = (await this.request.post(`/panel/storage/getStorageStatusData?plantId=${plantId}`, `storageSn=${id}`)).data.obj;
    const totalData = (await this.request.post(`/panel/storage/getStorageTotalData?plantId=${plantId}`, `storageSn=${id}`)).data.obj;
    const plantData = (await this.request.post('/device/getPlantTotalData', `plantId=${plantId}`)).data.obj;
    if (statusData && totalData && plantData) {
      return {
        power: parseFloat(statusData.loadPower),
        solarPower: parseFloat(statusData.ppv1),
        batteryPower: parseFloat(statusData.batPower),
        gridPower: parseFloat(statusData.gridPower),
        energy: parseFloat(totalData.useEnergyToday),
        solarEnergy: parseFloat(totalData.epvToday),
        batteryEnergy: parseFloat(totalData.chargeToday),
        gridEnergy: parseFloat(totalData.eToUserToday),
        monthlySavings: parseFloat(plantData.mMonth),
        totalSavings: parseFloat(plantData.mTotal),
        batterySOC: parseFloat(statusData.capacity)
      }
    }
  }

  /*
    mix type seems to be working for SPH inverters
  */
  async fetchMixData(id: string, plantId: string) {
    const statusData = (await this.request.post(`/panel/mix/getMIXStatusData?plantId=${plantId}`, `mixSn=${id}`)).data.obj;
    const totalData = (await this.request.post(`/panel/mix/getMIXTotalData?plantId=${plantId}`, `mixSn=${id}`)).data.obj;
    const plantData = (await this.request.post('/device/getPlantTotalData', `plantId=${plantId}`)).data.obj;
    if (statusData && totalData && plantData) {
      return {
        power: parseFloat(statusData.pLocalLoad),
        solarPower: parseFloat(statusData.pPv1),
        batteryPower: parseFloat(statusData.pdisCharge1),
        gridPower: parseFloat(statusData.pactouser),
        energy: parseFloat(totalData.elocalLoadToday),
        solarEnergy: parseFloat(totalData.epvToday),
        batteryEnergy: parseFloat(totalData.edischarge1Today),
        gridEnergy: parseFloat(totalData.elocalLoadToday),
        monthlySavings: 0, // doesn't seem to be available
        totalSavings: 0, // doesn't seem to be available
        batterySOC: parseFloat(statusData.SOC)
      }
    }
  }
}
