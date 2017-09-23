'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  // Private helpers
  _cp(src, dest) {
    this.fs.copy(
      this.templatePath(src),
      this.destinationPath(dest)
    );
  }

  _cpTpl(src, dest, props) {
    this.fs.copyTpl(
      this.templatePath(src),
      this.destinationPath(dest),
      props
    );
  }

  // Inquiry 
  prompting() {
    // Ascii art Yeoman .
    this.log(yosay(
      'Welcome to the remarkable ' + chalk.red('generator-janva-webapp') + ' generator!'
    ));

    const prompts = [{
      name: 'project-name',
      message: 'project name '
    }];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  // Write
  writing() {
    // Fixed parts
    this._cp('package.json', 'package.json');
    this._cp('jsconfig.json', 'jsconfig.json');
    this._cp('.eslintrc.js', '.eslintrc.js');
    this._cp('.gitignore', '.gitignore');
    // TODO: maybe  allow some options jquery, dash etc
    this._cp('bower.json', 'bower.json');

    // Flexible parts
    this.fs.copyTpl('index.html', 'app/index.html', {
      title: this.props.title
    });
  }
  // Install npm and bower dependencies (restorables/retrivalbes)
  install() {
    this.installDependencies();
  }
};
