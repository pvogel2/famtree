<?php
if ( ! defined( 'ABSPATH' ) ) exit;

require_once(FAMTREE_PLUGIN_DIR . 'includes/admin/save.php');
require_once(FAMTREE_PLUGIN_DIR . 'includes/database.php');
require_once(FAMTREE_PLUGIN_DIR . 'includes/admin/layout.php');
require_once(FAMTREE_PLUGIN_DIR . 'includes/admin/PersonsListTable.php');

/* Register settings script. */
function famtree_admin_init() {
  wp_register_script( 'famtree-admin-script-s', plugins_url('/../admin/js/script.js', __FILE__) );
  wp_register_script( 'famtree-admin-script-r', plugins_url('/../admin/js/Relation.js', __FILE__) );
  wp_register_script( 'famtree-admin-script-ms', plugins_url('/../admin/js/editor/ManagedSelect.js', __FILE__) );
  wp_register_script( 'famtree-admin-script-p', plugins_url('/../public/js/Person.js', __FILE__) );
  wp_register_script( 'famtree-admin-script-pl', plugins_url('/../public/js/PersonList.js', __FILE__) );
  wp_register_script( 'famtree-admin-script-e', plugins_url('/../admin/js/editor/PersonEditor.js', __FILE__) );
  wp_register_style( 'famtree-admin-style', plugins_url('/../admin/css/style.css', __FILE__) );

  add_settings_section(
    'famtree_globals_section', 
    __('Global settings', 'famtree'),
     'famtree_render_global_settings',    
    'famtree'                   
  );

  add_settings_field(
    'famtree_public_access',
    __('Visiblity of family data', 'famtree'),
    'famtree_render_public_access',
    'famtree',
    'famtree_globals_section'
 );

  register_setting('famtree', 'famtree_public_access', array(
    'type' => 'boolean',
    'description' => 'defines if the family data can be read for anonymus page visitors',
    )
  );
}

function famtree_add_type_attribute($tag, $handle, $src) {
  // if not your script, do nothing and return original $tag
  if ( 'famtree-admin-script-ms' !== $handle
    && 'famtree-admin-script-s' !== $handle
    && 'famtree-admin-script-e' !== $handle
    && 'famtree-admin-script-r' !== $handle
    && 'famtree-admin-script-pl' !== $handle
    && 'famtree-admin-script-p' !== $handle ) {
      return $tag;
  }
  // change the script tag by adding type="module" and return it.
  return wp_get_script_tag(
    array(
      'src'  => $src,
      'type' => 'module',
    )
  );
}

add_filter('script_loader_tag', 'famtree_add_type_attribute' , 10, 3);

function famtree_admin_scripts() {
  /*
   * It will be called only on your plugin admin page, enqueue our script here
   */
  wp_enqueue_script( 'famtree-admin-script-r' );
  wp_enqueue_script( 'famtree-admin-script-ms' );
  wp_enqueue_script( 'famtree-admin-script-p' );
  wp_enqueue_script( 'famtree-admin-script-pl' );
  wp_enqueue_script( 'famtree-admin-script-e' );
  wp_enqueue_script( 'famtree-admin-script-s' );
  wp_enqueue_script( 'wp-api-request' ); // include backbone wp api
  wp_enqueue_script( 'jquery-ui-dialog' ); // include modal dialog support
  wp_enqueue_media();
}

function famtree_admin_styles() {
  /*
   * It will be called only on your plugin admin page, enqueue our script here
   */
  wp_enqueue_style( 'wp-jquery-ui-dialog' );
  wp_enqueue_style( 'famtree-admin-style' );
}

/**
 * Add the top level menu page.
 */
function famtree_options_page() {
  $page = add_menu_page(
    'FamTree',
    'FamTree',
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
      famtree_render_page_title(__('FamTree configuration', 'famtree'));
      famtree_render_runtime_message();
      famtree_render_modal_dialog();
      famtree_render_import_dialog();
    ?>
    <form method="POST" action="options.php">
    <?php
      settings_fields('famtree');
      do_settings_sections('famtree');
      submit_button(__('Save global settings', 'famtree'));
    ?>
    </form>
    <?php
      famtree_render_section_title(__('Import gedcom data', 'famtree'));
      famtree_render_gedcom_import();
    ?>
    <?php
      famtree_render_section_title(__('Person configuration', 'famtree'));

      famtree_render_edit_person_form();
    ?>
  </div>
  <?php

  famtree_render_persons_listing();
}
