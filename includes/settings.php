<?php
require_once(PEDIGREE__PLUGIN_DIR . 'includes/admin/save.php');
require_once(PEDIGREE__PLUGIN_DIR . 'includes/database.php');
require_once(PEDIGREE__PLUGIN_DIR . 'includes/admin/layout.php');
require_once(PEDIGREE__PLUGIN_DIR . 'includes/admin/PersonsListTable.php');

function pedigree_field_families_cb() {
  $families = get_option( 'pedigree_families', array('default' => 'default') );
	$args = isset( $families ) ? (array) $families : array('default' => 'default');

  pedigree_render_families_fieldsets($args);
}

/* Register settings script. */
function pedigree_admin_init() {
  wp_register_script( 'pedigree-admin-script-s', plugins_url('/../admin/js/script.js', __FILE__) );
  wp_register_script( 'pedigree-admin-script-r', plugins_url('/../admin/js/relation.js', __FILE__) );
  wp_register_script( 'pedigree-admin-script-p', plugins_url('/../admin/js/person.js', __FILE__) );
  wp_register_script( 'pedigree-admin-script-e', plugins_url('/../admin/js/personEditor.js', __FILE__) );
  wp_register_style( 'pedigree-admin-style', plugins_url('/../admin/css/style.css', __FILE__) );
}

function pedigree_admin_scripts() {
  /*
   * It will be called only on your plugin admin page, enqueue our script here
   */
  wp_enqueue_script( 'pedigree-admin-script-r' );
  wp_enqueue_script( 'pedigree-admin-script-p' );
  wp_enqueue_script( 'pedigree-admin-script-e' );
  wp_enqueue_script( 'pedigree-admin-script-s' );
  wp_enqueue_script( 'wp-api-request' ); // include backbone wp api
  wp_enqueue_media();
}

function pedigree_admin_styles() {
  /*
   * It will be called only on your plugin admin page, enqueue our script here
   */
  wp_enqueue_style( 'pedigree-admin-style' );
}

/**
 * Add the top level menu page.
 */
function pedigree_options_page() {
  $page = add_menu_page(
    'Pedigree',
    'Pedigree Options',
    'pedigree_write',
    'pedigree',
    'pedigree_options_page_html'
  );
  add_action('admin_print_scripts-' . $page, 'pedigree_admin_scripts');
  add_action('admin_print_styles-' . $page, 'pedigree_admin_styles');
}

/**
 * Register our pedigree_options_page to the admin_menu action hook.
 */
add_action( 'admin_menu', 'pedigree_options_page' );


/**
 * Register javascript for the pedigree_options_page.
 */
add_action( 'admin_init', 'pedigree_admin_init' );

function pedigree_settings_capability($capability) {
  return 'pedigree_write';
}

add_filter( 'pedigree_capability_pedigree-options', 'pedigree_settings_capability' );

add_action( 'pedigree_success_feedback', 'pedigree_render_success_feedback' );
add_action( 'pedigree_error_feedback', 'pedigree_render_error_feedback' );

/**
 * Top level menu callback function
 */
function pedigree_options_page_html() {
  // check user capabilities
  if ( ! current_user_can( 'pedigree_write' ) ) {
    return;
  }
  ?>

  <div class="pedigree wrap">
    <?php
      pedigree_render_page_title(__(get_admin_page_title(), 'pedigree'));
      pedigree_render_runtime_message();

      pedigree_render_section_title(__('Person configuration', 'pedigree'));

      $families = get_option( 'pedigree_families', array('default' => 'default') );
      $args = isset( $families ) ? (array) $families : array('default' => 'default');
    
      pedigree_render_edit_person_form();
    ?>
  </div>
  <?php

  pedigree_render_persons_listing();
}
