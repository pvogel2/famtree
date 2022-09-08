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

function pedigree_is_delete_person() {
  return !empty($_POST['deleteId']);
}

function pedigree_delete_person() {
  $personId = sanitize_text_field($_POST['deleteId']);
  return pedigree_database_delete_person($personId);
}

function pedigree_is_save_person() {
  return (!empty($_POST['firstName']) && !empty($_POST['lastName']));
}

function pedigree_save_person() {
  $personId = sanitize_text_field($_POST['id']);
  if (empty($personId)) {
    return pedigree_database_create_person($_POST);
  } else {
    return pedigree_database_update_person($_POST);
  }
}