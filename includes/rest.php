<?php
require_once(FAMTREE_PLUGIN_DIR . 'includes/database.php');

function famtree_rest_permission_read() {
  return (current_user_can('famtree_load') || get_option('famtree_public_access'));
}

function famtree_rest_permission_write() {
  return current_user_can( 'famtree_write' );
}

// Also see https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/
function famtree_rest_register_routes() {
  $version = '1';
  $namespace = 'famtree/v' . $version;

  register_rest_route( $namespace, '/family/', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'famtree_database_get_persons',
    'permission_callback' => 'famtree_rest_permission_read',
  ));

  register_rest_route( $namespace, '/family/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'famtree_database_get_persons',
    'permission_callback' => 'famtree_rest_permission_read',
  ));

  register_rest_route( $namespace, '/person/', array(
    'methods' => WP_REST_Server::CREATABLE,
    'callback' => 'famtree_save_person',
    'permission_callback' => 'famtree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/person/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'famtree_delete_person',
    'permission_callback' => 'famtree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/person/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'famtree_save_person',
    'permission_callback' => 'famtree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/person/(?P<id>[\w%]+)/metadata', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'famtree_get_metadata',
    'permission_callback' => 'famtree_rest_permission_read',
  ));

  register_rest_route( $namespace, '/metadata/', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'famtree_save_metadata',
    'permission_callback' => 'famtree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/metadata/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'famtree_delete_metadata',
    'permission_callback' => 'famtree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/root/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'famtree_update_family_root',
    'permission_callback' => 'famtree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/relation/', array(
    'methods' => WP_REST_Server::CREATABLE,
    'callback' => 'famtree_save_relation',
    'permission_callback' => 'famtree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/relation/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'famtree_save_relation',
    'permission_callback' => 'famtree_rest_permission_write',
  ));

  register_rest_route( $namespace, '/relation/(?P<id>[\w%]+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'famtree_delete_relation',
    'permission_callback' => 'famtree_rest_permission_write',
  ));
}

add_action( 'rest_api_init', 'famtree_rest_register_routes');
