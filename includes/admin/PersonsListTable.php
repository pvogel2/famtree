<?php
if (!class_exists('WP_List_Table')) {
  require_once(ABSPATH . 'wp-admin/includes/class-wp-list-table.php');
}
  
require_once(FAMTREE_PLUGIN_DIR . 'includes/database.php');

class Famtree_Persons_List_Table extends WP_List_Table {
  private $persons_data;

  function single_row( $item ) {
    echo '<tr data-id="' . esc_html($item['id']) . '">';
    $this->single_row_columns( $item );
    echo '</tr>';
  }

  function get_columns() {
        $columns = array(
          'portraitId' => __('Image', 'famtree'),
          'root'      => __('Is root', 'famtree'),
          'firstName' => __('First name', 'famtree'),
          'surNames'  => __('Sur names', 'famtree'),
          'lastName'  => __('Last name', 'famtree'),
          'birthName' => __('Birth name', 'famtree'),
          'birthday'  => __('Birthday', 'famtree'),
          'deathday'  => __('Date of death', 'famtree'),
          'relations' => __('Relations', 'famtree'),
          'edit' => '',
        );
        return $columns;
      }

      function usort_reorder($a, $b) {
        $orderby = 'birthday';
        if (isset($_GET['orderby'])) {
          $orderby = sanitize_text_field($_GET['orderby']);
        }

        $order = 'desc';
        if (isset($_GET['orderby'])) {
          $order = sanitize_text_field($_GET['order']);
        }

        // Determine sort order
        $result = strcmp($a[$orderby], $b[$orderby]);

        // Send final sort direction to usort
        return ($order === 'asc') ? $result : -$result;
      }

      function column_default($item, $column_name) {
        $id = $item['id'];
        $portrait = $item['portraitId'];

        $avatarUrl = wp_get_attachment_image_url($portrait, 'thumbnail');
        if (!$avatarUrl) {
          $avatarUrl = get_avatar_url( '' );
        }

        // wp_get_attachment_image_url($portrait, 'thumbnail')
        switch ($column_name) {
          case 'portraitId' :return '<img alt="" src="' . esc_url($avatarUrl) . '" class="avatar avatar-32 photo" height="32" width="32" loading="lazy" decoding="async">';
          case 'root': return '<input data-portrait-url="' . wp_get_attachment_image_url($portrait, 'medium') . '" type="checkbox" ' . ( $item[$column_name] ? 'checked' : '' ) . ' onclick="window.famtree.updateRoot(this, ' . esc_html($id) . ')" />';
          case 'firstName': return esc_html($item[$column_name]);
          case 'surNames': return esc_html($item[$column_name]);
          case 'lastName': return esc_html($item[$column_name]);
          case 'birthName': return esc_html($item[$column_name]);
          case 'birthday': return esc_html($item[$column_name]);
          case 'deathday': return esc_html($item[$column_name]);
          case 'relations': return '<select disabled="disabled"></select>';
          case 'edit': return '<button type="button" title="' . esc_html_e('edit', 'famtree') . '" onclick="window.famtree.editPerson(' . esc_html($id) . ')" class="button icon"><span class="dashicons dashicons-edit"></span></button>';
          default:
            return print_r($item, true); //Show the whole array for troubleshooting purposes
        }
      }

      function get_sortable_columns() {
        $sortable_columns = array(
          'birthday' => array('birthday', true),
          'deathday' => array('deathday', true),
          'firstName'  => array('firstName', true),
          'lastName' => array('lastName', true),
          'birthName'   => array('birthName', true),
        );
        return $sortable_columns;
      }

      // Bind table with columns, data and all
      function prepare_items() {
        if (isset($_POST['page']) && isset($_POST['s'])) {
          $search = sanitize_text_field($_POST['s']);
          $this->persons_data = $this->get_persons_data($search);
        } else {
          $this->persons_data = $this->get_persons_data();
        }

        $columns = $this->get_columns();
        $hidden = array();
        $sortable = $this->get_sortable_columns();

        usort($this->persons_data, array(&$this, 'usort_reorder'));

        $this->_column_headers = array($columns, $hidden, $sortable);
        $this->items = $this->persons_data;
      }

      private function get_persons_data($search = '') {
        $persons = famtree_database_search_persons($search);
        return $persons;
      }
}
