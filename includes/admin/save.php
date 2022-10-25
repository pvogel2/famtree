<?php
require_once(PEDIGREE__PLUGIN_DIR . 'includes/database.php');

function pedigree_is_update_family_root() {
  return !empty($_POST['rootId']);
}

function pedigree_is_update_portrait_image() {
  return !empty($_POST['portrait-id']);
}

function pedigree_update_portrait_image() {
  $portraitId = sanitize_text_field($_POST['portrait-id']);
  $personId = sanitize_text_field($_POST['id']);
  return pedigree_database_update_portrait_image($personId, $portraitId);
}

function pedigree_update_family_root() {
  $personId = sanitize_text_field($_POST['rootId']);
  $isRoot = sanitize_text_field($_POST['rootValue']);
  return pedigree_database_update_root($personId, $isRoot);
}

function pedigree_get_preselect_family() {
  if (!empty($_POST['family'])) {
    return sanitize_text_field($_POST['family']);
  }
  return '';
}

function pedigree_delete_relation(WP_REST_Request $req = null) {
  $relationId = '';
  if (isset($req)) {
    $result = preg_match('/\/relation\/([0-9]+)$/', urldecode($req->get_route()), $matches);
    if ($result == 1) {
      $relationId = $matches[1];
    }
  }

  return pedigree_database_delete_relation($relationId);
}

function pedigree_sanitize_relation($flag) {
  $relationArgs = array(
    'id' => FILTER_VALIDATE_INT,
    'family' => FILTER_SANITIZE_STRING,
    'type' => FILTER_SANITIZE_STRING,
    'start' => FILTER_SANITIZE_STRING,
    'end' => FILTER_SANITIZE_STRING,
    'children' => array(
      'filter' => FILTER_VALIDATE_INT,
      'flags'  => FILTER_REQUIRE_ARRAY,
      ),
    'members' => array(
      'filter' => FILTER_VALIDATE_INT,
      'flags'  => FILTER_REQUIRE_ARRAY,
    ),
  );
  $relation = filter_input_array($flag, $relationArgs);
  if (empty($relation['type'])) {
    $relation['type'] = null;
  };
  if (empty($relation['start'])) {
    $relation['start'] = null;
  };
  if (empty($relation['end'])) {
    $relation['end'] = null;
  };
  if (!is_array($relation['children'])) {
    $relation['children'] = [];
  };
  if (!is_array($relation['members'])) {
    $relation['members'] = [];
  };

  return $relation;
}

function pedigree_sanitize_person($flag) {
  $personArgs = array(
    'id' => FILTER_VALIDATE_INT,
    'family' => FILTER_SANITIZE_STRING,
    'firstName' => FILTER_SANITIZE_STRING,
    'surNames' => FILTER_SANITIZE_STRING,
    'lastName' => FILTER_SANITIZE_STRING,
    'birthName' => FILTER_SANITIZE_STRING,
    'birthday' => FILTER_SANITIZE_STRING,
    'deathday' => FILTER_SANITIZE_STRING,
  );

  $person = filter_input_array($flag, $personArgs);

  if (empty($person['birthday'])) {
    $person['birthday'] = null;
  };
  if (empty($person['deathday'])) {
    $person['deathday'] = null;
  };

  return $person;
}

function pedigree_save_relation() {
  $relation = pedigree_sanitize_relation(INPUT_POST);

  if (empty($relation['id'])) {
    return pedigree_database_create_relation($relation);
  } else {
    return pedigree_database_update_relation($relation);
  }
}

function pedigree_delete_person(WP_REST_Request $req = null) {
  // TODO: also clean up relations and child lists
  $personId = '';
  if (isset($req)) {
    $result = preg_match('/\/person\/([0-9]+)$/', urldecode($req->get_route()), $matches);
    if ($result == 1) {
      $personId = $matches[1];
    }
  }

  return pedigree_database_delete_person($personId);
}

function pedigree_save_person() {
  $person = pedigree_sanitize_person(INPUT_POST);

  if (empty($person['id'])) {
    return pedigree_database_create_person($person);
  } else {
    return pedigree_database_update_person($person);
  }
}
