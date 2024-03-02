<?php
if ( ! defined( 'ABSPATH' ) ) exit;

require_once(FAMTREE_PLUGIN_DIR . 'includes/database.php');

function famtree_role_setup() {
  $capabilities = array(
    'read' => true,
    // 'read_private_pages' => true,
    'famtree_load' => true,
    'famtree_write' => true,
  );
  add_role( 'famtree', 'FamTree Member', $capabilities );

  $admin = get_role('administrator');
  $admin->add_cap('famtree_load');
  $admin->add_cap('famtree_write');
}

function famtree_role_teardown() {
  remove_role('famtree');

  $admin = get_role('administrator');
  $admin->remove_cap('famtree_load');
  $admin->remove_cap('famtree_write');
}

function famtree_activate() {
  famtree_database_setup();
  famtree_role_setup();
}

function famtree_disable_admin_bar( $content ) {
	return ( current_user_can( 'famtree' ) ) ? false : $content;
}

add_filter('show_admin_bar', 'famtree_disable_admin_bar');
