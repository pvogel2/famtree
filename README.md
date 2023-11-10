# FamTree WordPress Plugin

This plugin provides a block to manage and visualize family trees (Scaffolded with Create Block tool).

## Description

The plugin provides the FamTree Block showing configured family trees. The visualization is created in a virtual 3d scene using ThreeJS
and can be navigated using a mouse or keyboard.
Selecting a tree node (a person of the family tree) provides access to meta information for this person if configured.

A block can be configured to visualize the configured family of a founder, this can be switched on run time if configured in the block settings.

A famtree options page has been added to the admin panel to configure family trees relationships and persons.

These data is stored in dedicated plugin tables of the database used.

All block instances use the stored informations to visualize the desired family trees.

Multiple families are supported and can be configured on the famtree options page.

### Roles

The plugin creates a dedicated user role called 'famtree' with custom capabilities to read and write saved family trees.

The administrator role is also expanded to include these capabilities.

### Security

The block itself does not support access restrictions,
this can be achieved by using one of the several available Wordpress plugins available.

by default, only logged in users with famtree read access can see the family trees on a pubished page.

The plugin can be configured to give every sites visitor access to the stored data.

## Installation

Currently this is a semi automated process:
  * Ensure correct version number, currenlty used in
    * famtree.php
    * block.json
    * package.json
    * package-lock.json
    * readme.txt
  * Build the project using ```npm run build```
  * Export the project using ```npm run plugin-zip```
  * Upload the plugin zip file to the ```/wp-content/plugins/famtree``` directory, or install the plugin through the WordPress plugins screen directly.
  * Activate the plugin through the 'Plugins' screen in WordPress
