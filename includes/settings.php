<?php
require_once(PEDIGREE__PLUGIN_DIR . 'includes/admin/save.php');
require_once(PEDIGREE__PLUGIN_DIR . 'includes/database.php');
require_once(PEDIGREE__PLUGIN_DIR . 'includes/admin/layout.php');

// Register a new setting for "pedigree" page.
function pedigree_settings_init() {
  $args = array(
    'type' => 'array',
    'default' => array(
      'families' => array(
        'default' => 'default',
      ),
    ),
  );
  register_setting( 'pedigree-options', 'pedigree_families',  $args);

  // Register a new section in the "pedigree" page.
  add_settings_section(
    'pedigree-options',
    __( 'Families configuration', 'pedigree' ), 'pedigree_section_options',
    'pedigree'
  );

  // Register a new field in the "pedigree-options" section.
  add_settings_field(
    'pedigree_field_families', // As of WP 4.6 this value is used only internally.
    __( 'Configure available families', 'pedigree' ),
    'pedigree_field_families_cb',
    'pedigree',
    'pedigree-options',
    array(
     'label_for'         => 'pedigree_field_families', // Use $args' label_for to populate the id inside the callback.
     'class'             => 'pedigree_row',
     'pedigree_custom_data' => 'custom',
    )
  );
}

function pedigree_field_families_cb() {
  $families = get_option( 'pedigree_families', array('default' => 'default') );
	$args = isset( $families ) ? (array) $families : array('default' => 'default');

  pedigree_render_families_fieldsets($args);
}

function pedigree_section_options() {
  print(__('Here familes can be added and removed. Each person currently can be related to one family. The pedigree block shows persons relations of one family.', 'pedigree'));
}

/* Register settings script. */
function pedigree_admin_init() {
  wp_register_script( 'pedigree-admin-script', plugins_url('/../admin/js/script.js', __FILE__) );
  pedigree_settings_init();
}

function pedigree_admin_scripts() {
  /*
   * It will be called only on your plugin admin page, enqueue our script here
   */
  wp_enqueue_script( 'pedigree-admin-script' );
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

  if (!empty($_POST)) {
    $result = FALSE;
    $message = __('Undefined action', 'pedigree');

    if (pedigree_is_update_family_root()) {
      $result = pedigree_update_family_root();
      $message = __('Root updated', 'pedigree');
    } else if (pedigree_is_delete_person()) {
      $result = pedigree_delete_person();
      $message = __('Person deleted', 'pedigree');
    } else if (pedigree_is_save_person()) {
      $result = pedigree_save_person();
      $message = __('Person saved', 'pedigree');
    }

    if ($result == TRUE) {
      do_action( 'pedigree_success_feedback', $message);
    } else {
      do_action( 'pedigree_error_feedback', $message);
    }
  }

  // check if the user have submitted the settings
  // WordPress will add the "settings-updated" $_GET parameter to the url
  if ( isset( $_GET['settings-updated'] ) ) {
     add_settings_error( 'pedigree_messages', 'pedigree_message', __( 'Settings Saved', 'pedigree' ), 'updated' );
  }
  // show error/update messages
  settings_errors( 'pedigree_messages' );
  ?>
  <div class="pedigree wrap">
    <?php pedigree_render_page_title(__(get_admin_page_title(), 'pedigree')) ?>
  
    <form action="options.php" method="post">
      <?php
      settings_fields( 'pedigree-options' );
      do_settings_sections( 'pedigree' );
      submit_button( 'Save Families' );
      ?>
    </form>

    <?php
      pedigree_render_section_title(__('Persons configuration', 'pedigree'));

      $families = get_option( 'pedigree_families', array('default' => 'default') );
      $args = isset( $families ) ? (array) $families : array('default' => 'default');
    
      pedigree_render_edit_person_form($args);
      pedigree_render_delete_person_form();
      pedigree_render_update_root_form();
    ?>
  </div>
  <?php

  $results = pedigree_database_get_persons();
  $persons = $results['persons'];

  pedigree_render_persons_listing($persons);
}
