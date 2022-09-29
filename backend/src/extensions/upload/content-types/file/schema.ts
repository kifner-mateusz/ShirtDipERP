"use strict";

const { FOLDER_MODEL_UID } = require("../../constants");

export default {
  collectionName: "files",
  info: {
    singularName: "file",
    pluralName: "files",
    displayName: "File",
    description: "",
  },
  options: {},
  pluginOptions: {
    "content-manager": {
      visible: true,
    },
    "content-type-builder": {
      visible: true,
    },
  },
  attributes: {
    name: {
      type: "string",
      configurable: false,
      required: true,
    },
    alternativeText: {
      type: "string",
      configurable: false,
    },
    caption: {
      type: "string",
      configurable: false,
    },
    width: {
      type: "integer",
      configurable: false,
    },
    height: {
      type: "integer",
      configurable: false,
    },
    formats: {
      type: "json",
      configurable: false,
    },
    hash: {
      type: "string",
      configurable: false,
      required: true,
    },
    ext: {
      type: "string",
      configurable: false,
    },
    mime: {
      type: "string",
      configurable: false,
      required: true,
    },
    size: {
      type: "decimal",
      configurable: false,
      required: true,
    },
    url: {
      type: "string",
      configurable: false,
      required: true,
    },
    previewUrl: {
      type: "string",
      configurable: false,
    },
    provider: {
      type: "string",
      configurable: false,
      required: true,
    },
    provider_metadata: {
      type: "json",
      configurable: false,
    },
    related: {
      type: "relation",
      relation: "morphToMany",
      configurable: false,
    },
    folder: {
      type: "relation",
      relation: "manyToOne",
      target: FOLDER_MODEL_UID,
      inversedBy: "files",
      configurable: false,
      private: true,
    },
    folderPath: {
      type: "string",
      min: 1,
      required: true,
      configurable: false,
      private: true,
    },
    public: {
      type: "boolean",
      configurable: false,
      default: false,
    },
    token: {
      type: "string",
      configurable: false,
      maxLength: 48,
    },
  },
  // experimental feature:
  indexes: [
    {
      name: "upload_files_folder_path_index",
      columns: ["folder_path"],
      type: null,
    },
  ],
};
