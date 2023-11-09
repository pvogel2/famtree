# FamTree WordPress Plugin

This plugin provides a block to manage and visualize family trees (Scaffolded with Create Block tool).

## Description

The plugin provides the FamTree Block showing configured family trees. The visualization is setup in a virtual 3d scene using threejs and can be navigated by mouse or keyboard. Selecting a tree node (a person of the family tree) provides access to meta information for this person if configured.

One block can be configured to visualize the configured family of a founder, this can be switched on run time if configured in the block settings.

Multiple families are supported and can be configured on the famtree options page.

The plugin creates a dedicated user role named 'famtree' with custom capabilities to read and write stored family trees.

The administrator role also is extended with this capabilities.

An options page for the famtree plugin is added to the admin panel for configuring the relations and persons of the family trees.

These data are stored in dedicated plugin tables of the used database.

All block instances use the stored informations to visualize the desired founder family trees.

### Security

The block itself does not support access restrictions when used inside a page, this can be achieved by using one of the several available WP plugins.

Per default only logged in users with famtree read access can see the family trees on a pubished page.

The plugin can be configured to grant access to the stored data for any page visitors.

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
