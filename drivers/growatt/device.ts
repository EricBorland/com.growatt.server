import { Device } from 'homey';

class GrowattDevice extends Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('GrowattDevice has been initialized');
    const settings = this.getSettings();
    const data = this.getData();
    await this.fetchData(settings, data);
    setInterval(
      async () => await this.fetchData(settings, data),
      30 * 1000
    );
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('GrowattDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings: {}, newSettings: {}, changedKeys: {} }): Promise<string|void> {
    this.log('GrowattDevice settings where changed');
    // TODO Clear intervals
    await this.onInit();
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('GrowattDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('GrowattDevice has been deleted');
  }

  async fetchData(settings: any, data: any) {
    const result = await this.driver.api.fetch({
      username: settings.username,
      password: settings.password,
      id: data.id,
      plantId: data.plantId,
      type: data.type
    });
    if (result) {
      const promises = [];
      promises.push(this.setCapabilityValue('meter_solar_power', result.solarPower));
      promises.push(this.setCapabilityValue('meter_battery_power', result.batteryPower));
      promises.push(this.setCapabilityValue('meter_grid_power', result.gridPower));
      promises.push(this.setCapabilityValue('meter_power', result.energy));
      promises.push(this.setCapabilityValue('measure_solar_energy', result.solarEnergy));
      promises.push(this.setCapabilityValue('measure_battery_energy', result.batteryEnergy));
      promises.push(this.setCapabilityValue('measure_grid_energy', result.gridEnergy));
      promises.push(this.setCapabilityValue('measure_power', result.power));
      promises.push(this.setCapabilityValue('monthly_savings', result.monthlySavings));
      promises.push(this.setCapabilityValue('total_savings', result.totalSavings));
      promises.push(this.setCapabilityValue('measure_battery', result.batterySOC));
      await Promise.all(promises);
    }
  }
}

module.exports = GrowattDevice;
