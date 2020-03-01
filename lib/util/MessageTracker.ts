import debounce from 'lodash.debounce';

declare type timestamp = number;
declare type trackedHash = { [id: string]: timestamp };
export class MessageTracker {
  private tracked = {} as trackedHash;
  private store: () => void;

  constructor(public name: string, private kv: any, delay = 200) {
    kv.get(`cruisemonkey.messagetracker.${name}`).then((lastUpdate: trackedHash) => {
      if (lastUpdate) {
        Object.assign(this.tracked, lastUpdate);
      }
    });
    this.store = debounce(this.save, delay);
  }

  save() {
    return this.kv.set(`cruisemonkey.messagetracker.${this.name}`, this.tracked);
  }

  seen(id: string, ts: timestamp): boolean {
    return (this.tracked[id] || 0) >= ts;
  }

  touch(id: string, ts: timestamp) {
    const newValue = Math.max(this.tracked[id]||0, ts);
    if (newValue !== this.tracked[id]) {
      this.tracked[id] = newValue;
      this.store();
    }
  }
}