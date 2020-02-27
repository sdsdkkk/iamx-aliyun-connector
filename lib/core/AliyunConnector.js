'use strict';

const Promise = require('bluebird');
const AccountManager = require('./AccountManager').AccountManager;
const Schema = require('./Schema');
const Metadata = require('./Metadata').ModuleMetadata;

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
      .then(this.accountManager.attachPolicies(mContext.ramUser, mContext.accessPolicies))
      .then(this.accountManager.addToGroups(mContext.ramUser, mContext.groups))
      .then(this.accountManager.createLoginProfile(mContext.ramUser, mContext.loginProfile))
      .then(() => Promise.resolve(mContext));
  };

  revoke (context) {
    let mContext = { ...context };
    return this.accountManager.deleteLoginProfile(mContext.ramUser, mContext.loginProfile)
      .then(this.accountManager.detachPolicies(mContext.ramUser, mContext.accessPolicies))
      .then(this.accountManager.removeFromGroups(mContext.ramUser, mContext.groups))
      .then(this.accountManager.deleteUser(mContext.ramUser))
      .then(() => Promise.resolve(mContext));
  };

  show (context) {
    let mContext = { ...context };
    return this.accountManager.getUser(mContext.ramUser)
      .then(() => Promise.resolve(mContext));
  };
};
