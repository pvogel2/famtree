<?php
require_once(PEDIGREE__PLUGIN_DIR . 'includes/admin/save.php');
require_once(PEDIGREE__PLUGIN_DIR . 'includes/database.php');
require_once(PEDIGREE__PLUGIN_DIR . 'includes/admin/layout.php');
require_once(PEDIGREE__PLUGIN_DIR . 'includes/admin/PersonsListTable.php');

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
    __( 'Family configuration', 'pedigree' ), 'pedigree_section_options',
    'pedigree'
  );

  // Register a new field in the "pedigree-options" section.
  add_settings_field(
    'pedigree_field_families', // As of WP 4.6 this value is used only internally.
    __( 'Families', 'pedigree' ),
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
  wp_register_script( 'pedigree-admin-script-s', plugins_url('/../admin/js/script.js', __FILE__) );
  wp_register_script( 'pedigree-admin-script-r', plugins_url('/../admin/js/relation.js', __FILE__) );
  wp_register_script( 'pedigree-admin-script-p', plugins_url('/../admin/js/person.js', __FILE__) );
  wp_register_script( 'pedigree-admin-script-e', plugins_url('/../admin/js/personEditor.js', __FILE__) );
  wp_register_style( 'pedigree-admin-style', plugins_url('/../admin/css/style.css', __FILE__) );
  pedigree_settings_init();
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

// TODO: find better way, this is POC
function pedigree_setup_js_data() {
  $data = pedigree_database_get_persons();
  ?>
  <script>
    window.pedigree = window.pedigree || {};
    window.pedigree.relations = [];
    let r;
  <?php
  foreach($data['relations'] as $r) {
  ?>
    r = {
      id: '<?php echo $r->id ?>',
      family: '<?php echo $r->family ?>',
      type: '<?php echo $r->type ?>',
      start: '<?php echo $r->start ?>',
      end: '<?php echo $r->end ?>', 
      children: <?php echo $r->children ?>,
      members: <?php echo $r->members ?>,
    };
    window.pedigree.relations.push({...r});
    <?php
  }
  ?></script><?php
}
/**
 * Top level menu callback function
 */
function pedigree_options_page_html() {
  // check user capabilities
  if ( ! current_user_can( 'pedigree_write' ) ) {
    return;
  }

  $preselectfamily = '';

  if (!empty($_POST) && !isset($_POST['page'])) {
    $result = FALSE;
    $message = __('Undefined pedigree settings action', 'pedigree');

    if (pedigree_is_update_portrait_image()) {
      $result = pedigree_update_portrait_image();
      $message = __('Portrait image updated', 'pedigree');
    } else if (pedigree_is_update_family_root()) {
      $result = pedigree_update_family_root();
      $message = __('Root updated', 'pedigree');
    }

    if ($result == TRUE) {
      do_action( 'pedigree_success_feedback', $message);
    } else {
      do_action( 'pedigree_error_feedback', $message);
    }
    
    $preselectfamily = pedigree_get_preselect_family();
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
  
    <form action="options.php" method="post" class="form">
      <?php
      settings_fields( 'pedigree-options' );
      do_settings_sections( 'pedigree' );
      submit_button( 'Save Families' );
      ?>
    </form>

    <?php
      pedigree_render_section_title(__('Person configuration', 'pedigree'));

      $families = get_option( 'pedigree_families', array('default' => 'default') );
      $args = isset( $families ) ? (array) $families : array('default' => 'default');
    
      pedigree_render_edit_person_form($args, $preselectfamily);
      pedigree_render_update_root_form();

      pedigree_setup_js_data();
    ?>
  </div>
  <?php

  pedigree_render_persons_listing();
}
