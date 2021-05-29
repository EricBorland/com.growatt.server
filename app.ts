import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import Homey from 'homey';

class GrowattApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit(): Promise<void> {
    this.log('GrowattApp has been initialized');
  }
}

module.exports = GrowattApp;