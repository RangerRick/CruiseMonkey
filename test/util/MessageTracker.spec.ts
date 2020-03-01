import { MessageTracker } from '../../lib/util/MessageTracker';

class KV {
  public cache = {} as any;

  get(key: string) {
    return Promise.resolve(this.cache[key]);
  }

  set(key: string, value: any) {
    this.cache[key] = value;
    return Promise.resolve(value);
  }

}

describe('MessageTracker', () => {
  describe('empty cache', () => {
    let tracker: MessageTracker;
    let kv: KV;
    beforeEach(() => {
      kv = new KV();
      tracker = new MessageTracker('test', kv, 0);
    });
    test('seen: 0', () => {
      expect(tracker.seen('twitarr', 0)).toBe(true);
    });
    test('seen: 1', () => {
      expect(tracker.seen('twitarr', 1)).toBe(false);
    });
    test('touch: 1, seen: 1', (done) => {
      tracker.touch('twitarr', 1);
      setTimeout(() => {
        expect(tracker.seen('twitarr', 1)).toBe(true);
        expect(kv.cache).toEqual({ 'cruisemonkey.messagetracker.test': { twitarr: 1 }});
        done();
      }, 1);
    });
    test('touch: 50, touch: 25, seen: 26, seen: 51', (done) => {
      tracker.touch('twitarr', 50);
      setTimeout(() => {
        expect(kv.cache).toEqual({ 'cruisemonkey.messagetracker.test': { twitarr: 50 }});
        expect(tracker.seen('twitarr', 26)).toBe(true);
        tracker.touch('twitarr', 25);
        setTimeout(() => {
          expect(kv.cache).toEqual({ 'cruisemonkey.messagetracker.test': { twitarr: 50 }});
          expect(tracker.seen('twitarr', 26)).toBe(true);
          expect(tracker.seen('twitarr', 51)).toBe(false);
          done();
          }, 1);
      }, 1);
    });
  });
  describe('primed cache', () => {
    let tracker: MessageTracker;
    let kv: KV;
    beforeEach((done) => {
      kv = new KV;
      kv.cache = {
        'cruisemonkey.messagetracker.test': {
          twitarr: 50,
        },
      };
      tracker = new MessageTracker('test', kv, 0);
      setTimeout(done, 1);
    });
    test('seen: 0', () => {
      expect(tracker.seen('twitarr', 0)).toBe(true);
    });
    test('seen: 1', () => {
      expect(tracker.seen('twitarr', 1)).toBe(true);
    });
    test('seen: 50', () => {
      expect(tracker.seen('twitarr', 50)).toBe(true);
    });
    test('seen: 51', () => {
      expect(tracker.seen('twitarr', 51)).toBe(false);
    });
  })
});