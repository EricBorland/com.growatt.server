import { Driver } from 'homey';
import { GrowattAPI, GrowattDevice } from './api';

interface Device {
  name: string;
  data?: any;
  store?: any;
  settings?: any;
  icon?: string;
  capabilities?: string[];
  capabilitiesOptions?: any;
}

class GrowattDriver extends Driver {
  api = new GrowattAPI();

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('GrowattDriver has been initialized');
  }

  async onPair(session: any) {
    let username = '';
    let password = '';

    session.setHandler('login', async (data: any) => {
      username = data.username;
      password = data.password;

      return this.api.login(username, password);
    });

    session.setHandler('list_devices', async () => {
      const devices = await this.api.getDevices();

      return devices.map((device: GrowattDevice) => ({
        name: device.alias + ' (' + device.plantName + ' - ' + device.id + ')',
        data: device,
        settings: {
          username,
          password,
          refreshInterval: 60
        },
      }));
    });
  }
}

module.exports = GrowattDriver;