<?php
/**
 * Plugin Name:       Pedigree
 * Description:       Still experimental block to manage and visualize family trees (Scaffolded with Create Block tool).
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           0.9.2-beta
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

require_once(PEDIGREE__PLUGIN_DIR . 'includes/activation.php');
require_once(PEDIGREE__PLUGIN_DIR . 'includes/rest.php');
require_once(PEDIGREE__PLUGIN_DIR . 'includes/settings.php');

function pedigree_render_block($attributes) {
  return sprintf('<div
	  class="pedigree-block-container" style="position:relative; min-height: 640px;"
		data-founder="%1$s"
		data-founder-fab="%2$s"
		data-background-color="%3$s"
		data-foreground-color="%4$s"
		data-text-color="%5$s"
		data-highlight-color="%6$s"
		data-selection-color="%7$s"
	></div>',
	  esc_html( $attributes['founder'] ),
	  esc_html( $attributes['founderFAB'] ),
	  esc_html( $attributes['backgroundColor'] ),
	  esc_html( $attributes['foregroundColor'] ),
	  esc_html( $attributes['textColor'] ),
	  esc_html( $attributes['highlightColor'] ),
	  esc_html( $attributes['selectionColor'] )
  );
}

function create_block_pedigree_block_init() {
	register_block_type(
		__DIR__ . '/build',
		array(
			'render_callback' => 'pedigree_render_block',
	  )
	);
}

add_action( 'init', 'create_block_pedigree_block_init' );

register_activation_hook( __FILE__, 'pedigree_activate' );
register_deactivation_hook( __FILE__, 'pedigree_role_teardown' );
// To debug extra createt text messages:
// add_action('activated_plugin','my_save_error'); function my_save_error() { file_put_contents(dirname(__file__).'/error_activation.txt', ob_get_contents()); } 
