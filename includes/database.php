<?php

global $famtree_db_version;
$famtree_db_version = '6.0';

function famtree_persons_tablename() {
	global $wpdb;
  return $wpdb->prefix . 'famtree_persons';
}

function famtree_relations_tablename() {
	global $wpdb;
  return $wpdb->prefix . 'famtree_relations';
}

function famtree_metadata_tablename() {
	global $wpdb;
  return $wpdb->prefix . 'famtree_metadata';
}

function famtree_rename_persons_table() {
  global $wpdb;
  $old_table_name = $wpdb->prefix . 'famtree';
  $table_name = famtree_persons_tablename();
  if ($old_table_name != $table_name) {
    $ok = $wpdb->query("RENAME TABLE " . $old_table_name . " TO " . $table_name);
    if( !$ok ) {
      echo 'Failed to rename table. Last DB error: ' . $wpdb->last_error;
    }
  }
}

// https://codex.wordpress.org/Creating_Tables_with_Plugins
function famtree_database_setup() {
	global $wpdb;
  global $famtree_db_version;
  $installed_db_version = get_option( 'famtree_db_version' );

  if ($installed_db_version != $famtree_db_version) {
    famtree_rename_persons_table();

    $table_name = famtree_persons_tablename();

	  $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
		  id mediumint(9) NOT NULL AUTO_INCREMENT,
      root boolean DEFAULT FALSE,
		  firstName varchar(55) DEFAULT '' NOT NULL,
		  surNames varchar(55) DEFAULT '' NOT NULL,
		  lastName varchar(55) DEFAULT '' NOT NULL,
		  birthName varchar(55) DEFAULT '' NOT NULL,
		  birthday date NULL DEFAULT NULL,
		  deathday date NULL DEFAULT NULL,
      portraitId mediumint(9) DEFAULT NULL,
		  PRIMARY KEY  (id)
	  ) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    dbDelta( $sql );

	  $table_name = famtree_relations_tablename();

	  $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
		  id mediumint(9) NOT NULL AUTO_INCREMENT,
      type varchar(55) NULL DEFAULT NULL,
      start date NULL DEFAULT NULL,
      end date NULL DEFAULT NULL,
		  members json NOT NULL,
		  children json NOT NULL,
		  PRIMARY KEY  (id)
	  ) $charset_collate;";

    dbDelta( $sql );

	  $table_name = famtree_metadata_tablename();

	  $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
		  id mediumint(9) NOT NULL AUTO_INCREMENT,
		  refId mediumint(9) NOT NULL,
		  mediaId mediumint(9) NOT NULL,
      refDate date NULL DEFAULT NULL,
      content json NULL DEFAULT NULL,
		  PRIMARY KEY  (id)
	  ) $charset_collate;";

    dbDelta( $sql );

	  add_option( 'famtree_db_version', $famtree_db_version );
	  update_option( 'famtree_db_version', $famtree_db_version );
  }
}

function famtree_update_db_check() {
  global $famtree_db_version;
  if ( get_site_option( 'famtree_db_version' ) != $famtree_db_version ) {
    famtree_database_setup();
  }
}
add_action( 'plugins_loaded', 'famtree_update_db_check' );

function famtree_database_search_persons($search) {
  global $wpdb;

  $table_name = famtree_persons_tablename();

  if (empty($search)) {
    $pResults = $wpdb->get_results( "SELECT * FROM $table_name", ARRAY_A );
  } else {
    $pResults = $wpdb->get_results( "SELECT * FROM $table_name WHERE firstName LIKE '%{$search}%' OR lastName LIKE '%{$search}%'", ARRAY_A );
  }

  $table_name = famtree_relations_tablename();
  $rResults = $wpdb->get_results( "SELECT * FROM $table_name", ARRAY_A );

  return $pResults;
}

function famtree_database_get_persons() {
  global $wpdb;

  $table_name = famtree_persons_tablename();
  // to add relations to the result directly from db
  // SELECT p.*,r.id relations FROM `wp_testfamtree_persons` AS p LEFT JOIN `wp_testfamtree_relations` AS r ON JSON_CONTAINS(r.members, CONCAT('[',p.id,']'))
  $pRresults = $wpdb->get_results( "SELECT * FROM $table_name", OBJECT );

  foreach ($pRresults as &$item) {
    $item->portraitUrl = wp_get_attachment_image_url($item->portraitId, 'thumbnail');
  }

  $table_name = famtree_relations_tablename();

  $rResults = $wpdb->get_results( "SELECT * FROM $table_name", OBJECT );

  return array(
    'persons' => $pRresults,
    'relations' => $rResults,
  );
}

function famtree_database_get_metadata($personId) {
  global $wpdb;

  $table_name = famtree_metadata_tablename();
  // to add relations to the result directly from db
  // SELECT p.*,r.id relations FROM `wp_testfamtree_persons` AS p LEFT JOIN `wp_testfamtree_relations` AS r ON JSON_CONTAINS(r.members, CONCAT('[',p.id,']'))
  $results = $wpdb->get_results( "SELECT * FROM $table_name WHERE refId='$personId'", OBJECT );

  foreach ($results as &$item) {
    $post = get_post($item->mediaId);
    $item->thumbnail = wp_get_attachment_image_url($item->mediaId, 'thumbnail');
    $item->original = $post->guid;
    $item->mimetype = $post->post_mime_type;
    $item->title = $post->post_title;
    $item->excerpt = $post->post_excerpt;
    $item->description = $post->post_content;
  }
  
  return $results;
}

function famtree_database_delete_relation($id) {
  global $wpdb;
  $table_name = famtree_relations_tablename();
  if (empty($id)) {
    return false;
  } else {
    return $wpdb -> delete( $table_name, array('id' => $id ));
  }
}

function famtree_database_delete_person($id) {
  global $wpdb;
  $table_name = famtree_persons_tablename();
  if (empty($id)) {
    return false;
  } else {
    return $wpdb -> delete( $table_name, array('id' => $id ));
  }
}

function famtree_database_delete_metadata($id) {
  global $wpdb;
  $table_name = famtree_metadata_tablename();
  if (empty($id)) {
    return false;
  } else {
    return $wpdb -> delete( $table_name, array('id' => $id ));
  }
}

function famtree_database_update_portrait_image($id, $mediaId) {
  global $wpdb;
  $table_name = famtree_persons_tablename();
  if (empty($id)) {
    return false;
  } else {
    $wpdb->update( 
      $table_name,
      array(
        'portraitId' => filter_var($mediaId, FILTER_SANITIZE_NUMBER_INT),
      ),
      array(
        'id' => $id,
      )
    );
    return true;
  }
}

function famtree_metadata_fields($metadata) {
  return array(
    'refId' => $metadata['refId'],
    'mediaId' => $metadata['mediaId'],
  );
}

function famtree_database_create_metadata($metadata) {
	global $wpdb;
	$table_name = famtree_metadata_tablename();

  $result = (boolean) $wpdb->insert( 
    $table_name, 
    famtree_metadata_fields($metadata)
  );

  if (!$result) {
    return false;
  }

  $item = new stdClass();;
  $post = get_post($metadata['mediaId']);

  $item->thumbnail = wp_get_attachment_image_url($metadata['mediaId'], 'thumbnail');
  $item->original = $post->guid;
  $item->mimetype = $post->post_mime_type;
  $item->title = $post->post_title;
  $item->excerpt = $post->post_excerpt;
  $item->description = $post->post_content;
  $item->id = $wpdb->insert_id;
  $item->refId = $metadata['refId'];
  $item->mediaId = $metadata['mediaId'];
  $item->refDate = null;
  $item->content = null;


  return $item;
}

function famtree_database_update_root($id, $value) {
  global $wpdb;
  $table_name = famtree_persons_tablename();
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

function famtree_database_modify_relation() {
  $relationId = sanitize_text_field($_POST['relationId']);
}

function famtree_database_remove_relation() {
  $relationId = sanitize_text_field($_POST['relationId']);
}

function famtree_person_fields($person) {
  return array(
    'firstName' => $person['firstName'],
    'surNames' => $person['surNames'],
    'lastName' => $person['lastName'],
    'birthName' => $person['birthName'],
    'birthday' => $person['birthday'],
    'deathday' => $person['deathday'],
    'portraitId' => $person['portraitId'],
  );
}

function famtree_database_create_person($person) {
	global $wpdb;
	$table_name = famtree_persons_tablename();

  $result = (boolean) $wpdb->insert( 
    $table_name, 
    famtree_person_fields($person)
  );
  return $result;
}

function famtree_database_update_person($person) {
	global $wpdb;
  $id = $person['id'];

  if (empty($id)) {
    return false;
  }
	$table_name = famtree_persons_tablename();
  $result = $wpdb->update( 
    $table_name,
    famtree_person_fields($person),
    array(
      'id' => $id,
    )
  );
  return is_numeric($result) || $result;
}

function famtree_relation_fields($relation) {
  return array(
    'type' => $relation['type'],
    'start' => $relation['start'],
    'end' => $relation['end'],
    'members' => json_encode($relation['members']),
    'children' => json_encode($relation['children']),
  );
}

function famtree_database_create_relation($relation) {
	global $wpdb;
	$table_name = famtree_relations_tablename();

  $result = (boolean) $wpdb->insert( 
    $table_name, 
    famtree_relation_fields($relation)
  );
  return $result;
}

function famtree_database_update_relation($relation) {
	global $wpdb;
	$table_name = famtree_relations_tablename();

  $result = (boolean) $wpdb->update( 
    $table_name, 
    famtree_relation_fields($relation),
    array(
      'id' => $relation['id'],
    )
  );
  return is_numeric($result) || $result;
}
