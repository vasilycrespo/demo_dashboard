# Sample dashboard
This demo includes a real time chat application managed by a dashboard, with a few tools like graphs for plotting on real time, message box, socket communication, and more. For portability reasons, the back end (restapi) is made on a node server as well as the front end service. It uses an emulated database for showing purposes, all data is stored in JSON files. 

### Tech used
* NodeJS
* Express
* AngularJS 
* Jquery
* SocketIo
* Html5
* Css3
* Json

# Intallation

### pre-requisites

To be able to run this sample dashboard, the only prerequisite is to have installed node js on your device:

[Node js]

For any RPM based OS just run the following command on your terminal to accomplish the installation of Node JS.

```sh
$ yum install node
```

To verify that node was successfully installed on your system just run:

```sh
$ node --version
```

If everithing went good, the terminal should response something similar to this:

```sh
$ v0.10.42
```


### Downloading the app

Once you have node running on your system, the next step is to download or clone the sample app from the github repo:

[Github vasily crespo]

Or you can just clone it into a local repository using git. Run the following command on your terminal once you have created the desired directory and you're located inside of it:

```sh
$ git clone https://github.com/vasilycrespo/demo_dashboard.git
```

### Installation & running

Finally, once you have a fresh copy of the demo app on your local folder, go inside of it using cd command on terminal and then, located at the same level of server.js run the following command:

```sh
$ npm install
```
This will install all software & libraries required to make this project up and running. Once all the libraries have been downloaded and installed,  you can run the app using this command:

```sh
$ node server.js
```

If everithing is ok you should get the followiung feedback on the terminal:

```sh
$ frontend on port: 8080
$ restAPI started on port: 3030
$ Socket io listening at port 3000
```

You can use any web browser located on your local system to acces the app using the following adde

[http://localhost:8080/]

That should be all, now server must be up and running!


[Node js]: <https://nodejs.org/>
[Github vasily crespo]: <https://github.com/vasilycrespo/demo_dashboard>
[http://localhost:8080/]: <http://localhost:8080/>
