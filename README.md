Pipelinr
========

Pipelinr is a realtime data processing and visualization application to explore large datasets. Data processing, interaction and analysis make it possible to recognize patterns and trends in your data.

Project Setup
========

Be sure you have 
* Node.js + npm (http://nodejs.org/ - the installer should install npm as well) 
* MongoDB (http://www.mongodb.org/)

Clone the Pipelinr Project into your favorite project folders
* git clone https://github.com/wrobin/Pipelinr.git
* Or download the .zip file

Open 3 command prompts:

First command prompt:
* Make sure your data storage path exists (Windows default: C:\data\db\)
* move to your MongoDB installation directory: cd mongoDBdirectory/bin 
* type: mongod.exe

Second command prompt: 
* move to Pipelinr Backend: cd yourFolder/Pipelinr/Backend
* type: node app.js

Third command prompt:
* On Windows: make sure the npm AppData exists: C:\Users\your_account\AppData\Roaming\npm\
* On Windows: make sure Git is installed and registered in PATH variable 
* move to Pipelinr Frontend: cd yourFolder/Pipelinr/Frontend
* type: npm start

The first initializations of the application should take some time.

After that you will find the application at http://localhost:8000/app

Project Structure
========
* Frontend
  * app
    * css
    * img
    * js
      * app.js (provides angular modules, routes and project settings)
      * controllers.js (provides controllers for views)
      * directives.js (provides directives [components] for visualizations by d3.js)
      * filters.js (unused)
      * services.js (provides REST interfaces, business logic for controllers and websocket setup)
    * partials (all views of frontend project)
    * index.html (main file which includes external libraries and view wrapper)
  * test

* Backend
  * jobs (provides jobs for periodic execution)
  * models (schemes and models for persistence)
  * node_modules (third party libraries)
  * pipelinr_modules (own modules for data reduction, data analysis)
  * routes (REST interface of backend)
  * utils (utility functions)
  * app.js (main file which sets up http server, jobs, websockets, database events)
  * job-schedule.js (sets up jobs defined in jobs directory)

* Benchmark (files for backend benchmarking accomplished by bench-rest library)

* SampleRESTClient (uses the backend REST inerface to create pipelines and datasets and insert values)

Interface
========

How to publish your data to Pipelinr?

Create a pipeline
* Resource: POST: ../pipelines
* Json to submit: var data = { name: name, sampling: { task: task, perm: perm, rate: rate } };
* Data structure:
  * name: String
  * sampling: Object, null
  * task: Enumeration ["frequencySampling", "randomSampling", "intervalSampling"]
  * perm: Boolean
  * rate: Integer [1..99]