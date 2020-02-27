'use strict';

const Promise = require('bluebird');
const RPCClient = require('@alicloud/pop-core');

exports.AccountManager = class AccountManager {
  constructor (config) {
    this.config = config;
    this.rpcClient = Promise.promisifyAll(new RPCClient({
      accessKeyId: this.config.credentials.accessKeyId,
      accessKeySecret: this.config.credentials.accessKeySecret,
      endpoint: 'https://ram.aliyuncs.com',
      apiVersion: '2015-05-01'
    }));
  };

  createUser (ramUser) {
    return this.rpcClient.requestAsync('CreateUser', {
      UserName: ramUser.username,
      Comments: ramUser.comments || '',
      DisplayName: ramUser.displayName || '',
      Email: ramUser.email || '',
      MobilePhone: ramUser.mobilePhone || ''
    });
  };

  deleteUser (ramUser) {
    if (!ramUser.deleteUser) {
      return Promise.resolve(null);
    }
    return this.rpcClient.requestAsync('DeleteUser', { UserName: ramUser.username });
  };
};
