# generator-janva-webapp 
> A first stab at a Yeoman generator in an attempt to get deeper understanding of frontend tools. As such it will most likely be full of faults and error :-).

Prerequisites : node, npm , yo (Yeoman), git


## Installing Prerequisites 

To try it out you need to have node and npm (which comes bundled with node) installed on your system. Following links can be of help to get you started with node, npm and git. 

* [Node](https://nodejs.org)
* [Installing Node via package manager](https://nodejs.org/en/download/package-manager/)
* [Updating npm](https://docs.npmjs.com/getting-started/installing-node)
* [Installing git](https://git-scm.com/book/id/v2/Getting-Started-Installing-Git)

Using npm you can install Yeoman toolset 

```bash 
npm install -g yo
``` 

If you get errors of the kind `EACCESS` or `EPERM`  you're probably storing your node packages in folder accessible only by sudo. Using sudo to install packages, as workaround, is not recommended. Instead you can create a local folder for your own packages, add that folder to your path and set the npm prefix to that folder. If 
your not getting any errors (or still prefer to use sudo) you can skip this step. Also it might be a good idea to back up your `.bashrc` file in your home  directory.

```bash 
mkdir ${HOME}/npm-global
npm set prefix ${HOME}/npm-global
echo "export PATH=\${HOME}/npm-global/bin:\$PATH" >> \$HOME/.bashrc
source .bashrc
``` 
This might look more complicated than it actually is. The npm set prefix simply adds the line `prefix= ~/npm-global` in your home directories `.npmrc` file. The echo "export.. line appends export PATH=${HOME}/npm-global/bin:$PATH at the end of your `.bashrc` file  in your home directory. The final line  `source .bashrc` just executes `.bashrc` file in current shell environment, so we don't have to logout to make changes available. 


## Installing generator from git endpoint using npm

When npm installed it can be used to get a copy to your local system  as follows.

```bash 
npm install -g  https://github.com/janva/generator-janva-webapp.git
``` 

This will fetch a copy to your global node modules folder.

## Scaffolding project 

Time to scaffold a project. I will create a folder in my home directory 
and scaffold  a project inside that directory.

```bash 
cd ~/project-folder
mkdir web-project
cd web-project
yo janva-webapp
``` 
Answer question(S) and you should be good to go.

## Unistalling generator via npm

To uninstall generator that was installed using npm we again use npm command.

```bash 
npm uninstall -g generator-janva-webapp
``` 

and for completeness removing scaffolded project folder is just a matter of doing 

```bash 
cd ~
rm -rf ~/project-folder
``` 


## Alternative installation approach by cloning git repository

Rather than using npm it's possible to just clone the project into folder on your local system. 

```bash 
mkdir ~/projects-folder
cd ~/projects-folder
git clone  https://github.com/janva/generator-janva-webapp.git
``` 

To make the generator globally available in your system we can ask npm to link it for us.

```bash 
cd ~/projects-folder/generator-janva-webapp
npm link
``` 

`npm link` will create a symbolic link (symlink) in npm:s global node modules folder and make it point to location of this generator i.e the to the folder you executed the command from. If you're curios and want to see this is actually the case you can execute the following commands

```bash 
cd $(npm -g root)
ls -al | grep generator-janva-webapp 
```
## Scaffolding project 

Scaffolding a project now works the same way as when installing via npm. 

```bash 
cd ~/project-folder
mkdir web-project
cd web-project
yo janva-webapp
``` 

#### Removing installation and cleaning after alteranative approach

To remove the generator you want to remove the folder where the generator was cloned as well as the symlink in global node modules folder. If you have followed instructions above the following would do the job. 

```bash 
rm -rf ~/project-folder
cd $(npm -g root)
rm generator-janva-webapp
``` 
---