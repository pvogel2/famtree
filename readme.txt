=== FamTree ===
Contributors:      pvogel2
Tags:              family tree, family history, block, plugin
Requires at least: 6.3
Requires PHP:      7.0 
Tested up to:      6.5.4
Stable tag:        1.5.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

This plugin provides a block to manage and visualize family trees (Scaffolded with Create Block tool).

== Description ==

The plugin provides the FamTree Block showing configured family trees. The visualization is created in a virtual 3d scene using ThreeJS
and can be navigated using a mouse or keyboard.
Selecting a tree node (a person of the family tree) provides access to meta information for this person if configured.

A block can be configured to visualize the configured family of a founder, this can be switched on run time if configured in the block settings.

Multiple families are supported and can be configured on the famtree options page.

The source code of the plugin can be found on the github page https://github.com/pvogel2/famtree.

== Configuration ==

The block itself does not support access restrictions,
this can be achieved by using one of the several available Wordpress plugins available.

The plugin creates a dedicated user role called 'famtree' with custom capabilities to read and write saved family trees.

The administrator role is also expanded to include these capabilities.

A famtree options page has been added to the admin panel to configure family trees relationships and persons.

These data is stored in dedicated plugin tables of the database used.

All block instances use the stored informations to visualize the desired family trees.

by default, only logged in users with famtree read access can see the family trees on a pubished page.

The plugin can be configured to give every sites visitor access to the stored data.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/famtree` directory, or install the plugin through the WordPress plugins screen directly.
1. Activate the plugin through the 'Plugins' screen in WordPress.

== Screenshots ==

1. An example tree selected in the gutenberg editor of wordpress.
2. The example tree shown on the published page.

== Frequently Asked Questions ==

Currently no asked questions are known.

== Changelog ==

Version 1.1.0

Initial version deployed.

== Upgrade Notice ==

No upgrade notices are available right now.
