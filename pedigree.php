<?php
/**
 * Plugin Name:       Pedigree
 * Description:       Example static block scaffolded with Create Block tool.
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Peter Vogel
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       pedigree
 *
 * @package           create-block
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */

if( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

define( 'PEDIGREE__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

require_once(PEDIGREE__PLUGIN_DIR . 'include/activation.php');
require_once(PEDIGREE__PLUGIN_DIR . 'include/rest.php');
require_once(PEDIGREE__PLUGIN_DIR . 'include/settings.php');

function create_block_pedigree_block_init() {
	register_block_type( __DIR__ . '/build' );
}

add_action( 'init', 'create_block_pedigree_block_init' );

register_activation_hook( __FILE__, 'pedigree_activate' );
register_deactivation_hook( __FILE__, 'pedigree_role_teardown' );
// To debug extra createt text messages:
// add_action('activated_plugin','my_save_error'); function my_save_error() { file_put_contents(dirname(__file__).'/error_activation.txt', ob_get_contents()); } 
