<?php

global $jal_db_version;
$jal_db_version = '1.0';

function pedigree_persons_tablename() {
	global $wpdb;
  return $wpdb->prefix . 'pedigree';
}

// https://codex.wordpress.org/Creating_Tables_with_Plugins
function pedigree_database_setup() {
	global $wpdb;
  global $jal_db_version;

	$table_name = pedigree_persons_tablename();

	$charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
		id mediumint(9) NOT NULL AUTO_INCREMENT,
    family varchar(55) DEFAULT '' NOT NULL,
    root BOOLEAN DEFAULT FALSE,
		firstName varchar(55) DEFAULT '' NOT NULL,
		surNames varchar(55) DEFAULT '' NOT NULL,
		lastName varchar(55) DEFAULT '' NOT NULL,
		birthName varchar(55) DEFAULT '' NOT NULL,
		birthday DATE NULL DEFAULT NULL,
		deathday DATE NULL DEFAULT NULL,
		partners JSON NOT NULL,
		children JSON NOT NULL,
		PRIMARY KEY  (id)
	) $charset_collate;";

  require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	dbDelta( $sql );

	add_option( 'jal_db_version', $jal_db_version );
}

function pedigree_database_get_persons_new() {
  global $wpdb;

  $table_name = $wpdb->prefix . 'pedigree';

  return $wpdb->get_results( "SELECT * FROM $table_name", ARRAY_A );
}

function pedigree_database_get_persons(WP_REST_Request $req = null) {
  global $wpdb;
  $id = '';
  if (isset($req)) {
    $id = urldecode($req->get_param('id'));
  }

  $table_name = $wpdb->prefix . 'pedigree';

  if (empty($id)) {
    $results = $wpdb->get_results( "SELECT * FROM $table_name", OBJECT );
  } else {
    $results = $wpdb->get_results( "SELECT * FROM $table_name WHERE family='$id'", OBJECT );
  }

  $families = get_option( 'pedigree_families', array('default' => 'default') );
  // $json = json_encode($results);
  return array(
    'persons' => $results,
    'families' => $families,
  );
}

function pedigree_database_delete_person($id) {
  global $wpdb;
  $table_name = $wpdb->prefix . 'pedigree';
  if (empty($id)) {
    return false;
  } else {
    return $wpdb -> delete( $table_name, array('id' => $id ));
  }
}

function pedigree_database_update_root($id, $value) {
  global $wpdb;
  $table_name = $wpdb->prefix . 'pedigree';
  if (empty($id)) {
    return false;
  } else {
    $wpdb->update( 
      $table_name,
      array(
        'root' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
      ),
      array(
        'id' => $id,
      )
    );
    return true;
  }
}

function pedigree_database_create_person($person) {
	global $wpdb;
	$table_name = pedigree_persons_tablename();

  $family = sanitize_text_field($person['family']);
  $firstName = sanitize_text_field($person['firstName']);
  $surNames = sanitize_text_field($person['surNames']);
  $lastName = sanitize_text_field($person['lastName']);
  $birthName = sanitize_text_field($person['birthName']);
  $children = sanitize_text_field($person['children']);
  $partners = sanitize_text_field($person['partners']);

  $birthday = sanitize_text_field($person['birthday']);
  $deathday = sanitize_text_field($person['deathday']);
  if (empty($birthday)) {
    $birthday = null;
  };
  if (empty($deathday)) {
    $deathday = null;
  };
  $result = (boolean) $wpdb->insert( 
    $table_name, 
    array(
      'family' => $family,
      'firstName' => $firstName,
      'surNames' => $surNames,
      'lastName' => $lastName,
      'birthName' => $birthName,
      'birthday' => $birthday,
      'deathday' => $deathday,
      'partners' => '[' . $partners . ']',
      'children' => '[' . $children . ']',
    )
  );
  return $result;
}

function pedigree_database_update_person($person) {
	global $wpdb;
	$table_name = pedigree_persons_tablename();

  $personId = sanitize_text_field($person['id']);
  $family = sanitize_text_field($person['family']);
  $firstName = sanitize_text_field($person['firstName']);
  $surNames = sanitize_text_field($person['surNames']);
  $lastName = sanitize_text_field($person['lastName']);
  $birthName = sanitize_text_field($person['birthName']);
  $children = sanitize_text_field($person['children']);
  $partners = sanitize_text_field($person['partners']);

  $birthday = sanitize_text_field($person['birthday']);
  $deathday = sanitize_text_field($person['deathday']);

  if (empty($birthday)) {
    $birthday = null;
  };
  if (empty($deathday)) {
    $deathday = null;
  };

  $result = $wpdb->update( 
    $table_name, 
    array(
      'family' => $family,
      'firstName' => $firstName,
      'surNames' => $surNames,
      'lastName' => $lastName,
      'birthName' => $birthName,
      'birthday' => $birthday,
      'deathday' => $deathday,
      'partners' => '[' . $partners . ']',
      'children' => '[' . $children . ']',
    ),
    array(
      'id' => $personId,
    )
  );
  return is_numeric($result) || $result;
}
