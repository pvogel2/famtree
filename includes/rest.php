<?php
require_once(PEDIGREE__PLUGIN_DIR . 'includes/database.php');

function pedigree_rest_permission_read() {
  return current_user_can( 'pedigree_load' );
}

function pedigree_rest_permission_write() {
  return current_user_can( 'pedigree_write' );
}

// Also see https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/
function pedigree_rest_register_routes() {
  $version = '1';
  $namespace = 'pedigree/v' . $version;

  register_rest_route( $namespace, '/family/', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'pedigree_database_get_persons',
    'permission_callback' => 'pedigree_rest_permission_read',
  ));

  register_rest_route( $namespace, '/family/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'pedigree_database_get_persons',
    'permission_callback' => 'pedigree_rest_permission_read',
  ));

  register_rest_route( $namespace, '/person/', array(
    'methods' => WP_REST_Server::CREATABLE,
    'callback' => 'pedigree_save_person',
    'permission_callback' => 'pedigree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/person/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'pedigree_delete_person',
    'permission_callback' => 'pedigree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/person/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'pedigree_save_person',
    'permission_callback' => 'pedigree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/person/(?P<id>[\w%]+)/metadata', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'pedigree_get_metadata',
    'permission_callback' => 'pedigree_rest_permission_read',
  ));

  register_rest_route( $namespace, '/metadata/', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'pedigree_save_metadata',
    'permission_callback' => 'pedigree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/metadata/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'pedigree_delete_metadata',
    'permission_callback' => 'pedigree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/root/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'pedigree_update_family_root',
    'permission_callback' => 'pedigree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/relation/', array(
    'methods' => WP_REST_Server::CREATABLE,
    'callback' => 'pedigree_save_relation',
    'permission_callback' => 'pedigree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/relation/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'pedigree_save_relation',
    'permission_callback' => 'pedigree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/relation/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'pedigree_delete_relation',
    'permission_callback' => 'pedigree_rest_permission_write',
  ));
}

add_action( 'rest_api_init', 'pedigree_rest_register_routes');
