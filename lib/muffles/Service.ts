import angular, { IRootScopeService, ILogService } from 'angular';
import { IQService, IPromise } from "angular";

const KV_USER_MUFFLES_KEY = 'user.muffles';

import '../data/DB';

class MuffleService {
  public ready: IPromise<void>;
  private muffles = [] as string[];

  /* @ngInject */
  constructor(private $log: ILogService, private $q: IQService, private $rootScope: IRootScopeService, private kv: any) {
    this.ready = this.kv.get(KV_USER_MUFFLES_KEY).then((muffles: string[] | undefined | null) => {
      if (Array.isArray(muffles)) {
        $log.debug(`MuffleService: ${muffles.length} muffle(s) loaded from cache.`);
        this.muffles = muffles;
      }
      return this.muffles;
    });

    $rootScope.$on('cruisemonkey.user.updated', (_ev: any, newUser: any) => {
      const index = this.muffles.indexOf(newUser.username);
      if (index >= 0) {
        this.muffles.splice(index, 1);
        this.kv.set(KV_USER_MUFFLES_KEY, this.muffles);
      }
    });
  }

  isMuffled(username: string) {
    return this.muffles.indexOf(username) >= 0;
  }

  toggle(username: string) {
    const deferred = this.$q.defer();
    const oldReady = this.ready;
    this.ready = deferred.promise as IPromise<void>;

    const index = this.muffles.indexOf(username);
    const muffle = index < 0;
    this.$log.debug(`MuffleService.toggle: ${username} muffled=${muffle}`);
    if (muffle) {
      this.muffles.push(username);
    } else {
      this.muffles.splice(index, 1);
    }
    this.$log.debug('MuffleService.toggle: muffles=' + this.muffles.join(','));
    return oldReady.then(() => {
      deferred.resolve(this.kv.set(KV_USER_MUFFLES_KEY, this.muffles));
      return this.ready.then(() => {
        this.$rootScope.$broadcast(`cruisemonkey.muffles.${username}`, muffle);
        this.$rootScope.$broadcast('cruisemonkey.muffles.updated', this.muffles);
        return !muffle;
      });
    });
  }
}

angular.module('cruisemonkey.muffles.Service', [
  'cruisemonkey.DB',
]).service('MuffleService', MuffleService);