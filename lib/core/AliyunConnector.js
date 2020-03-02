'use strict';

const Promise = require('bluebird');
const AccountManager = require('./AccountManager').AccountManager;
const Schema = require('./Schema');
const Metadata = require('./Metadata').ModuleMetadata;
const TimeoutDelay = 1000;

exports.Connector = class AliyunConnector {
  constructor (config) {
    this.accountManager = new AccountManager(config);
  };

  engine () {
    return Metadata.Engine;
  };

  version () {
    return Metadata.Version;
  };

  name () {
    return Metadata.Name;
  };

  supportedExecution () {
    return Metadata.SupportedExecution;
  };

  registryFormat () {
    return Schema.CredentialsRegistryDataSchema;
  };

  readContextFormat () {
    return Schema.ReadOnlyWorkflowContextSchema;
  };

  writeContextFormat () {
    return Schema.MutatingWorkflowContextSchema;
  };

  provision (context) {
    let mContext = { ...context };
    return this.accountManager.createUser(mContext.ramUser)
      .then(() => {
        return Promise.resolve(setTimeout(() => {
          this.accountManager.attachPolicies(mContext.ramUser, mContext.accessPolicies);
          this.accountManager.addToGroups(mContext.ramUser, mContext.groups);
          this.accountManager.createLoginProfile(mContext.ramUser, mContext.loginProfile);
        }, TimeoutDelay));
      })
      .then(() => Promise.resolve(mContext));
  };

  revoke (context) {
    let mContext = { ...context };
    return this.accountManager.deleteLoginProfile(mContext.ramUser, mContext.loginProfile)
      .then(this.accountManager.detachPolicies(mContext.ramUser, mContext.accessPolicies))
      .then(this.accountManager.removeFromGroups(mContext.ramUser, mContext.groups))
      .then(() => {
        return Promise.resolve(setTimeout(() => {
          this.accountManager.deleteUser(mContext.ramUser);
        }, TimeoutDelay));
      })
      .then(() => Promise.resolve(mContext));
  };

  show (context) {
    let mContext = { ...context };
    return this.accountManager.getUser(mContext.ramUser)
      .then(() => Promise.resolve(mContext));
  };
};
