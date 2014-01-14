'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var CandlebarsGenerator = module.exports = function CandlebarsGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({ skipInstall: options['skip-install'] });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(CandlebarsGenerator, yeoman.generators.Base);

CandlebarsGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    // have Yeoman greet the user.
    console.log(this.yeoman);

    var prompts = [
        {
            name: 'appName',
            message: 'Application name?'
        },
        {
            name: 'appDescription',
            message: 'Description?'
        },
        {
            name: 'features',
            message: 'Features?',
            type: 'checkbox',
            choices: [
                {
                    name: 'Normalize css',
                    value: 'installNormalize',
                    checked: true
                },
                {
                    name: 'Flexbox grid',
                    value: 'installFlexBoxGrid',
                    checked: true
                }
            ]
        },
        {
            name: 'git',
            message: 'Version control?',
            type: 'list',
            choices: [
                {
                    name: 'GitHub',
                    value: 'https://github.com',
                    default: true
                },
                {
                    name: 'Git'
                },
                {
                    name: 'none'
                }
            ]
        },
        {
            when: function (answers) {
                return (/Git/).test(answers.git);
            },
            name: 'git',
            message: 'Git server? (i.e., https://repo.org)'
        },
        {
            when: function (answers) {
                return !(/none/).test(answers.git);
            },
            name: 'gitUser',
            message: 'Username/organization?',
            default: this.user.git.username
        }
    ];

    this.prompt(prompts, function (props) {
        this.appTitle = this._.humanize(props.appName);
        this.appName = this._.slugify(props.appName);
        this.appDescription = this._.stripTags(props.appDescription);
        this.gitUser = this._.slugify(props.gitUser) || '';
        this.git = props.git || '';

        if (!(/none/).test(this.git) && this.appName && this.gitUser.length > 0) {
            this.gitHome = ''.concat(props.git, '/', this.gitUser, '/', this.appName);
            this.gitRepo = this.gitHome.concat('.git');
            this.gitBugs = this.gitHome.concat('/issues');

        } else {
            this.gitHome = this.gitRepo = this.gitBugs = '';
        }

        this.installNormalize = props.features.indexOf('installNormalize') > -1;
        this.installFlexBoxGrid = props.features.indexOf('installFlexBoxGrid') > -1;
        cb();
    }.bind(this));
};

CandlebarsGenerator.prototype.app = function app() {
    this.template('Gruntfile.js', 'Gruntfile.js');
    this.copy('_package.json', 'package.json');
    this.copy('_bower.json', 'bower.json');
};

CandlebarsGenerator.prototype.projectfiles = function projectfiles() {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
};

CandlebarsGenerator.prototype.scripts = function scripts() {
    this.mkdir('src/asset');
    this.copy('src/data/app.json', 'src/data/app.json');

    this.copy('src/js/_index.js', 'src/js/index.js');
    this.copy('src/js/app.js', 'src/js/'.concat(this.appName, '.js'));
    this.mkdir('src/js/'.concat(this.appName));

    this.copy('src/js/config.js', 'src/js/config.js');

    this.copy('src/less/_app.less', 'src/less/'.concat(this.appName, '.less'));
    this.copy('src/less/app/_config.less', 'src/less/'.concat(this.appName, '/config.less'));

    this.bulkDirectory('src/template', 'src/template');
};

CandlebarsGenerator.prototype.demo = function welcome() {

    this.copy('src/less/_index.less', 'src/less/index.less');

    this.copy('src/less/demo.less', 'src/less/demo.less');
    this.copy('src/less/demo/config.less', 'src/less/demo/config.less');

    this.copy('src/js/demo.js', 'src/js/demo.js');
    this.bulkDirectory('src/js/demo', 'src/js/demo');
    this.bulkDirectory('src/js/nls', 'src/js/nls');
};

CandlebarsGenerator.prototype.runtime = function runtime() {
    this.copy('gitignore', '.gitignore');
};
