# ASM-Simulator

####How to run the simulation:

* locate the folder with ASM-XXX in the main directory
* select the appropriate platform for your machine
* click on the file named ASM with the platform-specific extension



####Wher to find the documents:

* You can see the original research article [Here](http://link.springer.com/article/10.3758%2FBF03192931 "Springer")
* You can see a video tutorial of the simulator [Here](https://drive.google.com/open?id=0B-0aS93XwpzjWGlRVDd4UHlwRk0 "Video Tutorial")
* There are two IEEE software engineering documents included in the **IEEE** folder in the main directory

####Testing:

* Due to time constraints, there was little integration testing done among the modules described in the IEEE documents. Therefore, this version of the software is provided on an "As Is" basis. Known issues are:

	* when changing the simulation settings from the parameters window, certain number combinations would cause *"Nan"* values to appear for attributes. This will be addressed in the next version. (NOTE: if this happened during your simulation, you must quit the program and start over)

	* when attributes are activated, there is no visual indication other than the attribute weight changes.

	* to run the app with your latest changes locally, you can try `electron .` inside the main directory. In order to compile it for all platforms, you will need [electron-packager](https://github.com/electron-userland/electron-packager "electron-packager") to be installed, and then use the command: `electron-packager ./ --platform=all --arch=all --app-version=XXX --version=XXX` (replacing the XXX with the appropriate values).

####Roadmap:

The plan is to deliver this product to the client electronically. There will be a video tutorial included on the GitHub repository that explains the inner-workings of the code, as well as their connection to the original research article.

Remaining work on this project include:

* Adding GUI indicators for dynamic state of the simulation such as attribute activation and decay
* Bug fixes to address the Nan value issue when changing the parameters
* Incorporating any new requests of the client into version 2.0
* Publishing the software under GNU V3.0 or MIT open-source licenses
* Transfer the ownership of the repository to the original researcher
