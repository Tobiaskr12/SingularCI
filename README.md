[![BCH compliance](https://bettercodehub.com/edge/badge/Tobiaskr12/SingularCI?branch=main)](https://bettercodehub.com/)

## About SingularCI
SingularCI is a transpiler which allows you to translate CI/CD configuration files written with the SingularCI DSL to platform-specific CI/CD configuration files. SingularCI currently supports GitHub Actions and GitLab CI/CD. We hope to add support for many other platforms in the future (Jenkins, TravisCI, CircleCI, etc.). Please read the section [Contributing](#contributing), if you want to learn how to contribute to the project. 


### Built With
SingularCI is a NodeJS project written in TypeScript. In order to support non-NodeJS projects, the NPM package [pkg](https://www.npmjs.com/package/pkg) is used to wrap the system in executables for Windows, OS X and Linux. This means that you can use SingularCI with virtually any project on any computer.

## Getting Started
SingularCI can be installed as an NPM package or downloaded as a set of executeables. Regardless of which approach you choose, the first step is to add a `.singularci.yml` file to the root of your repository. This is the file where you write your pipelines. To learn more about how to structure this file and which keywords you can use, please see the [schema validation file](). (Not a valid link yet!)

#### NodeJS
If you want to use SingularCI in a NodeJS project, the easiest way to do it is by installing the [NPM package](https://www.npmjs.com/package/singularci) by running:

```sh
  npm install --save-dev singularci
```

When the package has been installed and your `.singularci.yml`-file is ready, you can generate configuration files for the platforms you wish to target by executing the command:
```sh
  npx singularci
``` 

#### Executables
All available executables can be found on the [releases page](https://github.com/Tobiaskr12/SingularCI/releases) of this repository. Download the file that suits your operating system and execute it from the root of the project containing your `.singularci.yml`-file in order to generate your configuration files.

## Contributing
If you have any suggestions for how SingularCI could be improved, please fork the repo and create a pull request. Alternatively, feel free to open an Issue explaining your suggestion.

Suggestions and feedback are greatly appreciated!

## License
Distributed under the GPL-3 License.
