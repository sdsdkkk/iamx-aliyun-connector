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

  getUser (ramUser) {
    return this.rpcClient.requestAsync('GetUser', {
      UserName: ramUser.username
    });
  };

  listAttachedPolicies (ramUser) {
    return this.rpcClient.requestAsync('ListPoliciesForUser', {
      UserName: ramUser.username
    });
  };

  listAssignedGroups (ramUser) {
    return this.rpcClient.requestAsync('ListGroupsForUser', {
      UserName: ramUser.username
    });
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

  createLoginProfile(ramUser, loginProfile) {
    if (!loginProfile || !loginProfile.password) {
      return Promise.resolve(null);
    }
    return this.rpcClient.requestAsync('CreateLoginProfile', {
      UserName: ramUser.username,
      Password: loginProfile.password,
      PasswordResetRequired: loginProfile.requirePasswordReset
    });
  };

  deleteLoginProfile (ramUser) {
    if (!ramUser.deleteUser) {
      return Promise.resolve(null);
    }
    return this.rpcClient.requestAsync('DeleteLoginProfile', { UserName: ramUser.username });
  };

  attachPolicies (ramUser, accessPolicies) {
    return this._attachUserPolicies(ramUser, accessPolicies && accessPolicies.userPolicies || []);
  };

  detachPolicies (ramUser, accessPolicies) {
    if (!ramUser.deleteUser) {
      return this._detachUserPolicies(ramUser, accessPolicies && accessPolicies.userPolicies || []);
    }
    return this.listAttachedPolicies(ramUser)
        .then((result) => {
          let attachedPolicies = result.Policies.Policy.map((o) => {
            return { name: o.PolicyName, type: o.PolicyType };
          });
          return this._detachUserPolicies(ramUser, attachedPolicies);
        });
  };

  addToGroups (ramUser, accessPolicies) {
    return this._addToGroups(ramUser, accessPolicies && accessPolicies.groups || []);
  };

  removeFromGroups (ramUser, accessPolicies) {
    if (!ramUser.deleteUser) {
      return this._removeFromGroups(ramUser, accessPolicies && accessPolicies.groups || []);
    }
    return this.listAssignedGroups(ramUser)
        .then((result) => {
          let assignedGroups = result.Groups.Group.map((o) => o.GroupName);
          return this._removeFromGroups(ramUser, assignedGroups);
        });
  };

  _attachUserPolicies (ramUser, userPolicies) {
    return Promise.map(userPolicies, (userPolicy) => {
      return this.rpcClient.requestAsync('AttachPolicyToUser', {
        UserName: ramUser.username,
        PolicyName: userPolicy.name,
        PolicyType: userPolicy.type
      });
    });
  };

  _detachUserPolicies (ramUser, userPolicies) {
    return Promise.map(userPolicies, (userPolicy) => {
      return this.rpcClient.requestAsync('DetachPolicyFromUser', {
        UserName: ramUser.username,
        PolicyName: userPolicy
      });
    });
  };

  _addToGroups (ramUser, groups) {
    return Promise.map(groups, (group) => {
      return this.rpcClient.requestAsync('AddUserToGroup', {
        UserName: ramUser.username,
        GroupName: group
      });
    });
  };

  _removeFromGroups (ramUser, groups) {
    return Promise.map(groups, (group) => {
      return this.rpcClient.requestAsync('RemoveUserFromGroup', {
        UserName: ramUser.username,
        GroupName: group
      });
    });
  };
};
