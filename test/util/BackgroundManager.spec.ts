import 'capacitor-ibeacon';
import { BackgroundManager } from '../../lib/util/BackgroundManager';
import moment from 'moment-timezone';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let manager: any;

beforeEach(() => {
  manager = new BackgroundManager();
});

const uuidValues = {
  0: 'DEADBEEF-0000-0000-0000-000000000000',
  1: 'DEADBEEF-0000-0000-0000-000000000001',
  10: 'DEADBEEF-0000-0000-0000-00000000000a',
  17: 'DEADBEEF-0000-0000-0000-000000000011',
  23: 'DEADBEEF-0000-0000-0000-000000000017',
  48: 'DEADBEEF-0000-0000-0000-000000000030',
  350: 'DEADBEEF-0000-0000-0000-00000000015e',
};

xdescribe('BackgroundManager', () => {
  describe('#getIndex(uuid)', () => {
    for (const index of Object.keys(uuidValues)) {
      const uuid = uuidValues[index];
      test(String(uuid), () => {
        const intValue = parseInt(index, 10);
        expect(manager.getIndex(uuid)).toBe(intValue);
      });
    }
  });

  describe('#getUUID(number)', () => {
    for (const value of Object.keys(uuidValues)) {
      test(String(value), () => {
        expect(manager.getUUID(value)).toBe(uuidValues[value]);
      });
    }
  });

  describe('#getPingableUUIDs()', () => {
    test('0 seen', () => {
      expect(manager.getPingableUUIDs()).toEqual([
        'DEADBEEF-0000-0000-0000-000000000000',
        'DEADBEEF-0000-0000-0000-000000000001',
        'DEADBEEF-0000-0000-0000-000000000002',
        'DEADBEEF-0000-0000-0000-000000000003',
      ]);
    });
    test('2 seen', () => {
      manager._seenUUIDs.set('DEADBEEF-0000-0000-0000-000000000000', moment());
      manager._seenUUIDs.set('DEADBEEF-0000-0000-0000-000000000001', moment().subtract(27, 'minutes'));
      expect(manager.getPingableUUIDs()).toEqual([
        'DEADBEEF-0000-0000-0000-000000000002',
        'DEADBEEF-0000-0000-0000-000000000003',
      ]);
    });
    test('2 seen, 1 out of date', () => {
      manager._seenUUIDs.set('DEADBEEF-0000-0000-0000-000000000000', moment());
      manager._seenUUIDs.set('DEADBEEF-0000-0000-0000-000000000001', moment().subtract(5, 'minutes'));
      manager._seenUUIDs.set('DEADBEEF-0000-0000-0000-000000000002', moment().subtract(33, 'minutes'));
      expect(manager.getPingableUUIDs()).toEqual([
        'DEADBEEF-0000-0000-0000-000000000002',
        'DEADBEEF-0000-0000-0000-000000000003',
      ]);
    });
    test('all seen', () => {
      manager._seenUUIDs.set('DEADBEEF-0000-0000-0000-000000000000', moment());
      manager._seenUUIDs.set('DEADBEEF-0000-0000-0000-000000000001', moment().subtract(5, 'minutes'));
      manager._seenUUIDs.set('DEADBEEF-0000-0000-0000-000000000002', moment().subtract(10, 'minutes'));
      manager._seenUUIDs.set('DEADBEEF-0000-0000-0000-000000000003', moment().subtract(20, 'minutes'));
      expect(manager.getPingableUUIDs()).toEqual([]);
    });
  });

  describe('#doUpdate(IBeaconRegion)', () => {
    test('one UUID', () => {
      manager.doUpdate({
        uuid: 'DEADBEEF-0000-0000-0000-000000000000',
        identifier: 'foo1',
      });
      expect(manager.seenUUIDs).toEqual([ 'DEADBEEF-0000-0000-0000-000000000000' ]);
    });
    test('multiple UUIDs', () => {
      manager.doUpdate({
        uuid: 'DEADBEEF-0000-0000-0000-000000000000',
        identifier: 'foo1',
      });
      manager.doUpdate({
        uuid: 'DEADBEEF-0000-0000-0000-000000000001',
        identifier: 'foo2',
      });
      manager.doUpdate({
        uuid: 'DEADBEEF-0000-0000-0000-000000000002',
        identifier: 'foo3',
      });
    });
    test('repeat UUIDs', () => {
      manager.doUpdate({
        uuid: 'DEADBEEF-0000-0000-0000-000000000000',
        identifier: 'foo1',
      });
      manager.doUpdate({
        uuid: 'DEADBEEF-0000-0000-0000-000000000001',
        identifier: 'foo2',
      });
      manager.doUpdate({
        uuid: 'DEADBEEF-0000-0000-0000-000000000000',
        identifier: 'foo1',
      });
      expect(manager.seenUUIDs).toEqual([ 'DEADBEEF-0000-0000-0000-000000000001', 'DEADBEEF-0000-0000-0000-000000000000' ]);
    });
  });

  describe('#onUpdate(callback)', () => {
    test('1 callback', () => {
      let count = 0;
      manager.onUpdate(() => {
        count++;
      });
      manager.doUpdate({
        uuid: 'DEADBEEF-0000-0000-0000-000000000000',
        identifier: 'foo1',
      });
      expect(count).toEqual(1);
    });
    test('2 callbacks', () => {
      let count = 0;
      manager.onUpdate(() => {
        count++;
      });
      manager.onUpdate(() => {
        count++;
      });
      manager.doUpdate({
        uuid: 'DEADBEEF-0000-0000-0000-000000000000',
        identifier: 'foo1',
      });
      expect(count).toEqual(2);
    });
  });

  describe('#cancelUpdate(index)', () => {
    test('2 callbacks, 1 canceled', () => {
      let count = 0;
      const first = manager.onUpdate(() => {
        count++;
      });
      expect(first).toEqual(0);
      const second = manager.onUpdate(() => {
        count++;
      });
      expect(second).toEqual(1);
      manager.cancelUpdate(second);
      manager.doUpdate({
        uuid: 'DEADBEEF-0000-0000-0000-000000000000',
        identifier: 'foo1',
      });
      expect(count).toEqual(1);
    });
  });

  describe('#enteredRegion(IBeaconRegion)', () => {
    test('first run', () => {
      const doUpdate = jest.spyOn(manager, 'doUpdate');
      const slowDown = jest.spyOn(manager, 'slowDown');
      const speedUp = jest.spyOn(manager, 'speedUp');
      manager.enteredRegion({
        uuid: 'DEADBEEF-0000-0000-0000-000000000000',
        identifier: 'foo',
      });
      expect(doUpdate).toHaveBeenCalledTimes(1);
      expect(slowDown).toHaveBeenCalledTimes(0);
      expect(speedUp).toHaveBeenCalledTimes(0);
      expect(manager.lastUpdateTime).not.toBeNull();
      expect(manager.scanUUIDs.length).toEqual(4);
    });

    test('too soon', () => {
      manager.lastUpdateTime = moment().subtract(4, 'minutes');

      const doUpdate = jest.spyOn(manager, 'doUpdate');
      const slowDown = jest.spyOn(manager, 'slowDown');
      const speedUp = jest.spyOn(manager, 'speedUp');
      manager.enteredRegion({
        uuid: 'DEADBEEF-0000-0000-0000-000000000000',
        identifier: 'foo',
      });
      expect(doUpdate).toHaveBeenCalledTimes(0);
      expect(slowDown).toHaveBeenCalledTimes(1);
      expect(speedUp).toHaveBeenCalledTimes(0);
      expect(manager.scanUUIDs.length).toEqual(3);
    });

    test('too late', () => {
      manager.lastUpdateTime = moment().subtract(40, 'minutes');

      const doUpdate = jest.spyOn(manager, 'doUpdate');
      const slowDown = jest.spyOn(manager, 'slowDown');
      const speedUp = jest.spyOn(manager, 'speedUp');
      manager.enteredRegion({
        uuid: 'DEADBEEF-0000-0000-0000-000000000000',
        identifier: 'foo',
      });
      expect(doUpdate).toHaveBeenCalledTimes(1);
      expect(slowDown).toHaveBeenCalledTimes(0);
      expect(speedUp).toHaveBeenCalledTimes(1);
      expect(manager.scanUUIDs.length).toEqual(5);
    });

    test('just right', () => {
      manager.lastUpdateTime = moment().subtract(25, 'minutes');

      const doUpdate = jest.spyOn(manager, 'doUpdate');
      const slowDown = jest.spyOn(manager, 'slowDown');
      const speedUp = jest.spyOn(manager, 'speedUp');
      manager.enteredRegion({
        uuid: 'DEADBEEF-0000-0000-0000-000000000000',
        identifier: 'foo',
      });
      expect(doUpdate).toHaveBeenCalledTimes(1);
      expect(slowDown).toHaveBeenCalledTimes(0);
      expect(speedUp).toHaveBeenCalledTimes(0);
      expect(manager.scanUUIDs.length).toEqual(4);
    });
  });

  const mockStateChanges = (manager) => {
    manager.startScanning = jest.fn();
    manager.stopScanning = jest.fn();
    manager.ping = jest.fn();
  };

  describe('isActive: false => true', () => {
    test('enabled = false', (done) => {
      manager._isActive = false;
      manager._enabled = false;
      mockStateChanges(manager);
      manager.setActive();
      setTimeout(() => {
        expect(manager.startScanning).toHaveBeenCalledTimes(0);
        expect(manager.stopScanning).toHaveBeenCalledTimes(1);
        done();
      }, 5);
    });
    test('enabled = true', (done) => {
      manager._isActive = false;
      manager._enabled = true;
      mockStateChanges(manager);
      manager.setActive();
      setTimeout(() => {
        expect(manager.startScanning).toHaveBeenCalledTimes(0);
        expect(manager.stopScanning).toHaveBeenCalledTimes(1);
        done();
      }, 5);
    });
  });

  describe('isActive: true => false', () => {
    test('enabled = false', (done) => {
      manager._isActive = true;
      manager._enabled = false;
      mockStateChanges(manager);
      manager.setInactive();
      setTimeout(() => {
        expect(manager.startScanning).toHaveBeenCalledTimes(0);
        expect(manager.stopScanning).toHaveBeenCalledTimes(1);
        done();
      }, 5);
    });
    test('enabled = true', (done) => {
      manager._isActive = true;
      manager._enabled = true;
      mockStateChanges(manager);
      manager.setInactive();
      setTimeout(() => {
        expect(manager.startScanning).toHaveBeenCalledTimes(1);
        expect(manager.stopScanning).toHaveBeenCalledTimes(0);
        done();
      }, 5);
    });
  });

  describe('enabled: false => true', () => {
    test('isActive = false', (done) => {
      manager._isActive = false;
      manager._enabled = false;
      mockStateChanges(manager);
      manager.enable();
      setTimeout(() => {
        expect(manager.startScanning).toHaveBeenCalledTimes(1);
        expect(manager.stopScanning).toHaveBeenCalledTimes(0);
        done();
      }, 5);
    });
    test('isActive = true', (done) => {
      manager._isActive = true;
      manager._enabled = false;
      mockStateChanges(manager);
      manager.enable();
      setTimeout(() => {
        expect(manager.startScanning).toHaveBeenCalledTimes(0);
        expect(manager.stopScanning).toHaveBeenCalledTimes(1);
        done();
      }, 5);
    });
  });

  describe('enabled: true => false', () => {
    test('isActive = false', (done) => {
      manager._isActive = false;
      manager._enabled = true;
      mockStateChanges(manager);
      manager.disable();
      setTimeout(() => {
        expect(manager.startScanning).toHaveBeenCalledTimes(0);
        expect(manager.stopScanning).toHaveBeenCalledTimes(1);
        done();
      }, 5);
    });
    test('isActive = true', (done) => {
      manager._isActive = true;
      manager._enabled = true;
      mockStateChanges(manager);
      manager.disable();
      setTimeout(() => {
        expect(manager.startScanning).toHaveBeenCalledTimes(0);
        expect(manager.stopScanning).toHaveBeenCalledTimes(1);
        done();
      }, 5);
    });
  });

  describe('#startScanning()', () => {
    test('isActive = false, enabled = false', () => {
      manager._isActive = false;
      manager._enabled = false;
      manager.enableScan = jest.fn();
      manager.startScanning();
      expect(manager.enableScan).toHaveBeenCalledTimes(0);
    });
    test('isActive = false, enabled = true', () => {
      manager._isActive = false;
      manager._enabled = true;
      manager.enableScan = jest.fn();
      manager.startScanning();
      expect(manager.enableScan).toHaveBeenCalledTimes(1);
    });
    test('isActive = true, enabled = false', () => {
      manager._isActive = true;
      manager._enabled = false;
      manager.enableScan = jest.fn();
      manager.startScanning();
      expect(manager.enableScan).toHaveBeenCalledTimes(0);
    });
    test('isActive = true, enabled = true', () => {
      manager._isActive = true;
      manager._enabled = true;
      manager.enableScan = jest.fn();
      manager.startScanning();
      expect(manager.enableScan).toHaveBeenCalledTimes(0);
    });
  });
});
