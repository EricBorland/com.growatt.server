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
      this.setCapabilityValue('measure_power', result.power);
      this.setCapabilityValue('solar_power', result.solarPower);
      this.setCapabilityValue('battery_power', result.batteryPower);
      this.setCapabilityValue('grid_power', result.gridPower);
      this.setCapabilityValue('meter_power', result.energy);
      this.setCapabilityValue('solar_energy', result.solarEnergy);
      this.setCapabilityValue('battery_energy', result.batteryEnergy);
      this.setCapabilityValue('grid_energy', result.gridEnergy);
      this.setCapabilityValue('monthly_savings', result.monthlySavings);
      this.setCapabilityValue('total_savings', result.totalSavings);
      this.setCapabilityValue('measure_battery', result.batterySOC);
    }
  }
}

module.exports = GrowattDevice;
