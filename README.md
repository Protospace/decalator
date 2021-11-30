# Decalator

A web app that makes decals/labels and signage from templates
Decalators first raison d'être is to generate signage at [Protospace](https://protospace.ca/)

## To Do

- Generate a new SVG from template...
  - OK, libxmljs2 is pretty limiting. I can change text but having a hell of a time doing more then that
  - Maybe switch over to svg.js/svgdom as our SVG editing toolset...experiment with that now....
  - so we CAN do this but it is messy...
  - every element we want to replace (e.g. toolId, toolName, toolQr, toolUrl) each require their own 'strategy' in a way...
    - we have to build + test each strategy
- [Express](https://www.npmjs.com/package/express) yourself
