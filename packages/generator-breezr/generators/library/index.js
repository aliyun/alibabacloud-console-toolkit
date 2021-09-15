"use strict";
const path = require("path");
const mkdirp = require("mkdirp");
const Generator = require("yeoman-generator");
const prompts = require("./prompts");
const { toCamelCase, toLowerCase, firstUpperCase } = require("../../utils");

module.exports = class extends Generator {
  _copyTpl(source, target, slots) {
    this.fs.copyTpl(
      this.templatePath(source),
      this.destinationPath(target),
      slots,
      {},
      {
        globOptions: { dot: true }
      }
    );
  }

  _createPackageJson() {
    const {
      needTS,
      lowerCaseName,
      authorName,
      authorEmail,
      gitRepo
    } = this.props;
    const pkg = needTS ? "package.ts.json" : "package.json";
    this._copyTpl(pkg, "package.json", {
      lowerCaseName,
      authorName,
      authorEmail,
      gitRepo
    });
  }

  _createReadme() {
    const { lowerCaseName, upperCaseName } = this.props;
    this._copyTpl("README.md", "README.md", { upperCaseName, lowerCaseName });
  }

  _createConfig() {
    const { lowerCaseName, upperCaseName, needTS } = this.props;

    if (needTS) {
      this._createTSConfig();
    } else {
      this._copyTpl("config", "config", { upperCaseName, lowerCaseName });
    }
  }

  _createTSConfig() {
    const { lowerCaseName, upperCaseName } = this.props;
    this._copyTpl("tsconfig", "", { upperCaseName, lowerCaseName });
  }

  _createDotfiles() {
    this._copyTpl("dotfiles/gitignore", ".gitignore");
    this._copyTpl("dotfiles/npmignore", ".npmignore");
    this._copyTpl("dotfiles/npmrc", ".npmrc");
  }

  _writingSrc() {
    const { upperCaseName, type, needTS } = this.props;
    const source = needTS
      ? `tssrc/${type.toLowerCase()}`
      : `src/${type.toLowerCase()}`;
    const target = `src`;
    this._copyTpl(source, target, { upperCaseName });
  }

  _writingTest() {
    const { upperCaseName, needTS } = this.props;
    const tests = needTS ? "tstests" : "tests";
    this._copyTpl(tests, "tests", { upperCaseName });
  }

  _writingStories() {
    const { upperCaseName, needTS } = this.props;
    const stories = needTS ? "tsstories" : "stories";
    this._copyTpl(stories, "stories", { upperCaseName });
  }

  initializing() {
    this.props = {};
  }

  prompting() {
    return this.prompt(prompts.call(this)).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
      this.props.lowerCaseName = toLowerCase(props.name);
      this.props.camelCaseName = toCamelCase(props.name);
      this.props.upperCaseName = firstUpperCase(this.props.camelCaseName);
    });
  }

  configuring() {
    const { name } = this.props;
    if (path.basename(this.destinationPath()) !== name) {
      this.log(
        `Your generator must be inside a folder named ${name}\nI'll automatically create this folder.`
      );
      mkdirp(name);
      this.destinationRoot(this.destinationPath(name));
    }

    this._createPackageJson();
    this._createConfig();
    this._createReadme();
    this._createDotfiles();
  }

  Writing() {
    this._writingSrc();
    this._writingTest();
    this._writingStories();
  }

  install() {
    this.spawnCommandSync("tnpm", ["install"]);
    // This.installDependencies({ bower: false });
  }
};
