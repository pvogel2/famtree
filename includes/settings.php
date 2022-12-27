<?php
require_once(FAMTREE_PLUGIN_DIR . 'includes/admin/save.php');
require_once(FAMTREE_PLUGIN_DIR . 'includes/database.php');
require_once(FAMTREE_PLUGIN_DIR . 'includes/admin/layout.php');
require_once(FAMTREE_PLUGIN_DIR . 'includes/admin/PersonsListTable.php');

function famtree_field_families_cb() {
  $families = get_option( 'famtree_families', array('default' => 'default') );
	$args = isset( $families ) ? (array) $families : array('default' => 'default');

  famtree_render_families_fieldsets($args);
}

/* Register settings script. */
function famtree_admin_init() {
  wp_register_script( 'famtree-admin-script-s', plugins_url('/../admin/js/script.js', __FILE__) );
  wp_register_script( 'famtree-admin-script-r', plugins_url('/../admin/js/relation.js', __FILE__) );
  wp_register_script( 'famtree-admin-script-p', plugins_url('/../admin/js/person.js', __FILE__) );
  wp_register_script( 'famtree-admin-script-e', plugins_url('/../admin/js/personEditor.js', __FILE__) );
  wp_register_style( 'famtree-admin-style', plugins_url('/../admin/css/style.css', __FILE__) );
}

function famtree_admin_scripts() {
  /*
   * It will be called only on your plugin admin page, enqueue our script here
   */
  wp_enqueue_script( 'famtree-admin-script-r' );
  wp_enqueue_script( 'famtree-admin-script-p' );
  wp_enqueue_script( 'famtree-admin-script-e' );
  wp_enqueue_script( 'famtree-admin-script-s' );
  wp_enqueue_script( 'wp-api-request' ); // include backbone wp api
  wp_enqueue_media();
}

function famtree_admin_styles() {
  /*
   * It will be called only on your plugin admin page, enqueue our script here
   */
  wp_enqueue_style( 'famtree-admin-style' );
}

/**
 * Add the top level menu page.
 */
function famtree_options_page() {
  $page = add_menu_page(
    'FamTree',
    'FamTree Options',
    'famtree_write',
    'famtree',
    'famtree_options_page_html'
  );
  add_action('admin_print_scripts-' . $page, 'famtree_admin_scripts');
  add_action('admin_print_styles-' . $page, 'famtree_admin_styles');
}

/**
 * Register our famtree_options_page to the admin_menu action hook.
 */
add_action( 'admin_menu', 'famtree_options_page' );


/**
 * Register javascript for the famtree_options_page.
 */
add_action( 'admin_init', 'famtree_admin_init' );

function famtree_settings_capability($capability) {
  return 'famtree_write';
}

add_filter( 'famtree_capability_famtree-options', 'famtree_settings_capability' );

add_action( 'famtree_success_feedback', 'famtree_render_success_feedback' );
add_action( 'famtree_error_feedback', 'famtree_render_error_feedback' );

/**
 * Top level menu callback function
 */
function famtree_options_page_html() {
  // check user capabilities
  if ( ! current_user_can( 'famtree_write' ) ) {
    return;
  }
  ?>

  <div class="famtree wrap">
    <?php
      famtree_render_page_title(__(get_admin_page_title(), 'famtree'));
      famtree_render_runtime_message();

      famtree_render_section_title(__('Person configuration', 'famtree'));

      $families = get_option( 'famtree_families', array('default' => 'default') );
      $args = isset( $families ) ? (array) $families : array('default' => 'default');
    
      famtree_render_edit_person_form();
    ?>
  </div>
  <?php

  famtree_render_persons_listing();
}
