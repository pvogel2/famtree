<?php
if ( ! defined( 'ABSPATH' ) ) exit;

global $famtree_db_version;
$famtree_db_version = '6.0';

function famtree_prefix_tablename($name) {
	global $wpdb;
  return $wpdb->prefix . 'famtree_'  . $name;
}

// https://codex.wordpress.org/Creating_Tables_with_Plugins
function famtree_database_setup() {
	global $wpdb;
  global $famtree_db_version;
  $installed_db_version = get_option( 'famtree_db_version' );

  if ($installed_db_version != $famtree_db_version) {
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE {$wpdb->prefix}famtree_persons (
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

    $sql = "CREATE TABLE {$wpdb->prefix}famtree_relations (
		  id mediumint(9) NOT NULL AUTO_INCREMENT,
      type varchar(55) NULL DEFAULT NULL,
      start date NULL DEFAULT NULL,
      end date NULL DEFAULT NULL,
		  members json NOT NULL,
		  children json NOT NULL,
		  PRIMARY KEY  (id)
	  ) $charset_collate;";

    dbDelta( $sql );

    $sql = "CREATE TABLE {$wpdb->prefix}famtree_metadata (
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

  if (empty($search)) {
    $pResults = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}famtree_persons", ARRAY_A );
  } else {
    $results_sql = $wpdb->prepare("SELECT * FROM {$wpdb->prefix}famtree_persons WHERE firstName LIKE '%s' OR lastName LIKE '%s'", '%' . $search . '%', '%' . $search . '%');
    $pResults = $wpdb->get_results($results_sql , ARRAY_A );
  }

  $rResults = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}famtree_relations", ARRAY_A );

  return $pResults;
}

function famtree_database_get_persons() {
  global $wpdb;

  // to add relations to the result directly from db
  // SELECT p.*,r.id relations FROM `wp_testfamtree_persons` AS p LEFT JOIN `wp_testfamtree_relations` AS r ON JSON_CONTAINS(r.members, CONCAT('[',p.id,']'))
  $pRresults = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}famtree_persons", OBJECT );

  foreach ($pRresults as &$item) {
    $item->portraitUrl = wp_get_attachment_image_url($item->portraitId, 'thumbnail');
  }

  $rResults = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}famtree_relations", OBJECT );

  return array(
    'persons' => $pRresults,
    'relations' => $rResults,
  );
}

function famtree_database_get_metadata($personId) {
  global $wpdb;

  // to add relations to the result directly from db
  // SELECT p.*,r.id relations FROM `wp_testfamtree_persons` AS p LEFT JOIN `wp_testfamtree_relations` AS r ON JSON_CONTAINS(r.members, CONCAT('[',p.id,']'))
  $results_sql = $wpdb->prepare("SELECT * FROM {$wpdb->prefix}famtree_metadata WHERE refId='%s'", $personId);
  $results = $wpdb->get_results($results_sql, OBJECT );

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

  if (empty($id)) {
    return false;
  } else {
    return $wpdb -> delete(
      famtree_prefix_tablename('relations'),
      array('id' => $id ),
    );
  }
}

function famtree_database_delete_person($id) {
  global $wpdb;

  if (empty($id)) {
    return false;
  } else {
    return $wpdb -> delete(
      famtree_prefix_tablename('persons'),
      array('id' => $id ),
    );
  }
}

function famtree_database_delete_metadata($id) {
  global $wpdb;

  if (empty($id)) {
    return false;
  } else {
    return $wpdb -> delete(
      famtree_prefix_tablename('metadata'),
      array('id' => $id ),
    );
  }
}

function famtree_database_update_portrait_image($id, $mediaId) {
  global $wpdb;

  if (empty($id)) {
    return false;
  } else {
    $wpdb->update( 
      famtree_prefix_tablename('persons'),
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

  $result = (boolean) $wpdb->insert( 
    famtree_prefix_tablename('metadata'),
    famtree_metadata_fields($metadata),
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

  if (empty($id)) {
    return false;
  } else {
    $wpdb->update( 
      famtree_prefix_tablename('persons'),
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

  $result = (boolean) $wpdb->insert( 
    famtree_prefix_tablename('persons'), 
    famtree_person_fields($person)
  );
  if ($result == true) {
    return $wpdb->insert_id;
  }

  return $result;
}

function famtree_database_update_person($person) {
	global $wpdb;
  $id = $person['id'];

  if (empty($id)) {
    return false;
  }
	$result = $wpdb->update( 
    famtree_prefix_tablename('persons'),
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

  $result = (boolean) $wpdb->insert( 
    famtree_prefix_tablename('relations'),
    famtree_relation_fields($relation),
  );
  return $result;
}

function famtree_database_update_relation($relation) {
	global $wpdb;

  $result = (boolean) $wpdb->update( 
    famtree_prefix_tablename('relations'),
    famtree_relation_fields($relation),
    array(
      'id' => $relation['id'],
    )
  );
  return is_numeric($result) || $result;
}
