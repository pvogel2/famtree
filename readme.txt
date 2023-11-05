=== FamTree ===
Contributors:      pvogel2
Tags:              block
Requires at least: 6.3
Requires PHP:      7.0 
Tested up to:      6.3.2
Stable tag:        0.0.1-beta
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

This plugin provides a block to manage and visualize family trees (Scaffolded with Create Block tool).

== Description ==

The plugin provides the FamTree Block showing configured family trees. The visualization is setup in a virtual 3d scene usign threejs and can be navigated by mouse or keyboard. Selecting a tree node (a person of the family tree) provides access to meta information of this person if configured.

One block can be configured to visualize the configured family of a founder, this can be switched on run time if configured in the block settings.

Multiple families are supported and can be configured on the famtree options page.

The block itself does not support access restricitons, this can be achieved by using one of the several available WP plugins.

The plugin creates a dedicated WP role named 'famtree' with custom capabilities to read and write stored family trees.

The administrator role also is extended with this capabilities.

The source code of the plugin can be found on the github page https://github.com/pvogel2/famtree.

== Configuration ==

An options page for the famtree plugin is added to the WP admin panel for configuring the relations and persons of the family trees.

These data are stored in dedicated plugin tables of the used database.

All block instances use the stored informations to visualize the desired founder family trees.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/famtree` directory, or install the plugin through the WordPress plugins screen directly.
1. Activate the plugin through the 'Plugins' screen in WordPress.

== Screenshots ==

1. An example tree selected in the gutenberg editor of wordpress.
2. The example tree shown on the published page.

== Frequently Asked Questions ==

Currently no asked questions are known.

== Changelog ==

Version 1.0.0

Initial vrsion deployed.

== Upgrade Notice ==

No upgrade notices are available right now.
