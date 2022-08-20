<?php
require_once(PEDIGREE__PLUGIN_DIR . 'includes/database.php');

function pedigree_role_setup() {
  $capabilities = array(
    'read' => true,
    // 'read_private_pages' => true,
    'pedigree_load' => true,
    'pedigree_write' => true,
  );
  add_role( 'pedigree', 'Pedigree Member', $capabilities );

  $admin = get_role('administrator');
  $admin->add_cap('pedigree_load');
  $admin->add_cap('pedigree_write');
}

function pedigree_role_teardown() {
  remove_role('pedigree');

  $admin = get_role('administrator');
  $admin->remove_cap('pedigree_load');
  $admin->remove_cap('pedigree_write');
}

function pedigree_activate() {
  pedigree_database_setup();
  pedigree_role_setup();
}

function pedigree_disable_admin_bar( $content ) {
	return ( current_user_can( 'pedigree' ) ) ? false : $content;
}

add_filter('show_admin_bar', 'pedigree_disable_admin_bar');
