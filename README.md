# FamTree WordPress Plugin

This plugin provides a block to manage and visualize family trees (Scaffolded with Create Block tool).

## Description

The plugin provides the FamTree Block showing configured family trees using threejs.

Multiple families are supported and can be configured on the famtree options page.

Each block instance can be configured to visualize the configured family of a so called founder with the option to switch the founder on run time.

Kepp in mind that the plugin is still in beta and currently in development.

### Security

The block itself does not support access restricitons, this can be achieved by using one of the several avilailable WP plugins.

### Roles

The plugin creates a dedicated WP role named 'famtree' with custom capabilities to read and write stored family trees.
The administrator role also is extended with this capabilities.

## Installation

Currently this is a semi automated process:
  * Ensure correct version number, currenlty used in
    * famtree.php
    * block.json
    * package.json
    * package-lock.json
  * Build the project using ```npm run build```
  * Export the project using ```npm run plugin-zip```
  * Upload the plugin zip file to the ```/wp-content/plugins/famtree``` directory, or install the plugin through the WordPress plugins screen directly.
  * Activate the plugin through the 'Plugins' screen in WordPress
