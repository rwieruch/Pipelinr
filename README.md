Pipelinr
========

Real-time visualization of big data

Project Structure
========
* Frontend
  * app
    * css (all css files of frontend project)
    * img (all image resources of frontend project)
    * js (all javascript files of frontend project)
      * app.js (provides angular modules, routes and project settings)
      * controllers.js (provides controllers for views)
      * directives.js (provides directives [components] for visualizations by d3.js)
      * filters.js (unused)
      * services.js (provides REST interfaces, business logic for controllers and websocket setup)
    * partials (all views of frontend project)
    * index.html (main file which includes external libraries and view wrapper)
    * async
  * test

* Backend
