<?php

global $pedigree_db_version;
$pedigree_db_version = '3.0';

function pedigree_persons_tablename() {
	global $wpdb;
  return $wpdb->prefix . 'pedigree_persons';
}

function pedigree_relations_tablename() {
	global $wpdb;
  return $wpdb->prefix . 'pedigree_relations';
}

function pedigree_rename_persons_table() {
  global $wpdb;
  $old_table_name = $wpdb->prefix . 'pedigree';
  $table_name = pedigree_persons_tablename();
  if ($old_table_name != $table_name) {
    $ok = $wpdb->query("RENAME TABLE " . $old_table_name . " TO " . $table_name);
    if( !$ok ) {
      echo 'Failed to rename table. Last DB error: ' . $wpdb->last_error;
    }
  }
}

// https://codex.wordpress.org/Creating_Tables_with_Plugins
function pedigree_database_setup() {
	global $wpdb;
  global $pedigree_db_version;
  $installed_db_version = get_option( 'pedigree_db_version' );

  if ($installed_db_version != $pedigree_db_version) {
    pedigree_rename_persons_table();

    $table_name = pedigree_persons_tablename();

	  $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
		  id mediumint(9) NOT NULL AUTO_INCREMENT,
      family varchar(55) DEFAULT '' NOT NULL,
      root boolean DEFAULT FALSE,
		  firstName varchar(55) DEFAULT '' NOT NULL,
		  surNames varchar(55) DEFAULT '' NOT NULL,
		  lastName varchar(55) DEFAULT '' NOT NULL,
		  birthName varchar(55) DEFAULT '' NOT NULL,
		  birthday date NULL DEFAULT NULL,
		  deathday date NULL DEFAULT NULL,
      portraitImageId mediumint(9) DEFAULT NULL,
		  PRIMARY KEY  (id)
	  ) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    dbDelta( $sql );

	  $table_name = pedigree_relations_tablename();

	  $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
		  id mediumint(9) NOT NULL AUTO_INCREMENT,
      family varchar(55) DEFAULT '' NOT NULL,
      type varchar(55) NULL DEFAULT NULL,
      start date NULL DEFAULT NULL,
      end date NULL DEFAULT NULL,
		  members json NOT NULL,
		  children json NOT NULL,
		  PRIMARY KEY  (id)
	  ) $charset_collate;";

    dbDelta( $sql );

	  add_option( 'pedigree_db_version', $pedigree_db_version );
	  update_option( 'pedigree_db_version', $pedigree_db_version );
  }
}

function pedigree_update_db_check() {
  global $pedigree_db_version;
  if ( get_site_option( 'pedigree_db_version' ) != $pedigree_db_version ) {
    pedigree_database_setup();
  }
}
add_action( 'plugins_loaded', 'pedigree_update_db_check' );

function pedigree_database_get_persons_new($search) {
  global $wpdb;

  $table_name = pedigree_persons_tablename();

  if (empty($search)) {
    $pResults = $wpdb->get_results( "SELECT * FROM $table_name", ARRAY_A );
  } else {
    $pResults = $wpdb->get_results( "SELECT * FROM $table_name WHERE family LIKE '%{$search}%' OR firstName LIKE '%{$search}%' OR lastName LIKE '%{$search}%'", ARRAY_A );
  }

  $table_name = pedigree_relations_tablename();
  $rResults = $wpdb->get_results( "SELECT * FROM $table_name", ARRAY_A );

  return $pResults;
}

function pedigree_database_get_persons(WP_REST_Request $req = null) {
  global $wpdb;
  $id = '';
  if (isset($req)) {
    $id = urldecode($req->get_param('id'));
  }

  $table_name = pedigree_persons_tablename();
  // to add relations to the result directly from db
  // SELECT p.*,r.id relations FROM `wp_testpedigree_persons` AS p LEFT JOIN `wp_testpedigree_relations` AS r ON JSON_CONTAINS(r.members, CONCAT('[',p.id,']'))
  if (empty($id)) {
    $pRresults = $wpdb->get_results( "SELECT * FROM $table_name", OBJECT );
  } else {
    $pRresults = $wpdb->get_results( "SELECT * FROM $table_name WHERE family='$id'", OBJECT );
  }

  foreach ($pRresults as &$item) {
    $item->portraitUrl = wp_get_attachment_image_url($item->portraitImageId, 'thumbnail');
  }
  $families = get_option( 'pedigree_families', array('default' => 'default') );


  $table_name = pedigree_relations_tablename();

  if (empty($id)) {
    $rResults = $wpdb->get_results( "SELECT * FROM $table_name", OBJECT );
  } else {
    $rResults = $wpdb->get_results( "SELECT * FROM $table_name WHERE family='$id'", OBJECT );
  }

  return array(
    'persons' => $pRresults,
    'families' => $families,
    'relations' => $rResults,
  );
}

function pedigree_database_delete_relation($id) {
  global $wpdb;
  $table_name = pedigree_relations_tablename();
  if (empty($id)) {
    return false;
  } else {
    return $wpdb -> delete( $table_name, array('id' => $id ));
  }
}

function pedigree_database_delete_person($id) {
  global $wpdb;
  $table_name = pedigree_persons_tablename();
  if (empty($id)) {
    return false;
  } else {
    return $wpdb -> delete( $table_name, array('id' => $id ));
  }
}

function pedigree_database_update_portrait_image($id, $mediaId) {
  global $wpdb;
  $table_name = pedigree_persons_tablename();
  if (empty($id)) {
    return false;
  } else {
    $wpdb->update( 
      $table_name,
      array(
        'portraitImageId' => filter_var($mediaId, FILTER_SANITIZE_NUMBER_INT),
      ),
      array(
        'id' => $id,
      )
    );
    return true;
  }
}

function pedigree_database_update_root($id, $value) {
  global $wpdb;
  $table_name = pedigree_persons_tablename();
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

function pedigree_database_modify_relation() {
  $relationId = sanitize_text_field($_POST['relationId']);
}

function pedigree_database_remove_relation() {
  $relationId = sanitize_text_field($_POST['relationId']);
}

function pedigree_person_fields($person) {
  return array(
    'family' => $person['family'],
    'firstName' => $person['firstName'],
    'surNames' => $person['surNames'],
    'lastName' => $person['lastName'],
    'birthName' => $person['birthName'],
    'birthday' => $person['birthday'],
    'deathday' => $person['deathday'],
  );
}

function pedigree_database_create_person($person) {
	global $wpdb;
	$table_name = pedigree_persons_tablename();

  $result = (boolean) $wpdb->insert( 
    $table_name, 
    pedigree_person_fields($person)
  );
  return $result;
}

function pedigree_database_update_person($person) {
	global $wpdb;
	$table_name = pedigree_persons_tablename();

  $result = $wpdb->update( 
    $table_name,
    pedigree_person_fields($person),
    array(
      'id' => $personId,
    )
  );
  return is_numeric($result) || $result;
}

function pedigree_relation_fields($relation) {
  return array(
    'family' => $relation['family'],
    'type' => $relation['type'],
    'start' => $relation['start'],
    'end' => $relation['end'],
    'members' => json_encode($relation['members']),
    'children' => json_encode($relation['children']),
  );
}

function pedigree_database_create_relation($relation) {
	global $wpdb;
	$table_name = pedigree_relations_tablename();

  $result = (boolean) $wpdb->insert( 
    $table_name, 
    pedigree_relation_fields($relation)
  );
  return $result;
}

function pedigree_database_update_relation($relation) {
	global $wpdb;
	$table_name = pedigree_relations_tablename();

  $result = (boolean) $wpdb->update( 
    $table_name, 
    pedigree_relation_fields($relation),
    array(
      'id' => $relation['id'],
    )
  );
  return is_numeric($result) || $result;
}
