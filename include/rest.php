<?php
require_once(PEDIGREE__PLUGIN_DIR . 'include/database.php');

function pedigree_rest_permission_get_family() {
  return current_user_can( 'pedigree_load' );
}

// Also see https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/
function pedigree_rest_register_routes() {
  $version = '1';
  $namespace = 'pedigree/v' . $version;

  register_rest_route( $namespace, '/family/(?P<id>\w+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'pedigree_database_get_persons',
    'permission_callback' => 'pedigree_rest_permission_get_family',
  ));

  register_rest_route( $namespace, '/person/(?P<id>\w+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'pedigree_database_remove_person',
    'permission_callback' => 'pedigree_rest_permission_get_family',
  ));

  register_rest_route( $namespace, '/root/(?P<id>\w+)', array(
    'methods' => WP_REST_Server::WRITABLE,
    'callback' => 'pedigree_database_update_root',
    'permission_callback' => 'pedigree_rest_permission_get_family',
  ));
}

add_action( 'rest_api_init', 'pedigree_rest_register_routes');
