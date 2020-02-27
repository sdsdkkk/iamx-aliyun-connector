'use strict';

const CredentialsRegistryDataSchema = {
  type: 'object',
  properties: {
    credentials: {
      type: 'object',
      properties: {
        accessKeyId: { type: 'string' },
        accessKeySecret: { type: 'string' }
      },
      required: [ 'accessKeyId', 'accessKeySecret' ]
    }
  },
  required: [ 'credentials' ]
};

const MutatingWorkflowContextSchema = {
  type: "object",
  properties: {
    ramUser: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        comments: { type: 'string' },
        displayName: { type: 'string' },
        email: { type: 'string' },
        mobilePhone: { type: 'string' },
        deleteUser: { type: 'boolean', default: false }
      },
      required: [ 'username' ]
    }
  }
};

const ReadOnlyWorkflowContextSchema = {
  type: 'object',
  properties: {
    iamUser: {
      type: 'object',
      properties: {
        username: { type: 'string' }
      },
      required: [ 'username' ]
    }
  }
};

exports.CredentialsRegistryDataSchema = CredentialsRegistryDataSchema;
exports.MutatingWorkflowContextSchema = MutatingWorkflowContextSchema;
exports.ReadOnlyWorkflowContextSchema = ReadOnlyWorkflowContextSchema;
