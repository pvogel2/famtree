<?php
if (!class_exists('WP_List_Table')) {
  require_once(ABSPATH . 'wp-admin/includes/class-wp-list-table.php');
}
  
require_once(PEDIGREE__PLUGIN_DIR . 'includes/database.php');

class Persons_List_Table extends WP_List_Table {
  private $persons_data;
      function get_columns() {
        $columns = array(
          'id' => 'Id',
          'firstName' => 'First name',
          'surNames'  => 'Sur names',
          'lastName'  => 'Last name',
          'birthName' => 'Birth name',
          'birthday'  => 'Birthday',
          'deathday'  => 'Deathday',
          'children'  =>'Children',
          'partners'  => 'Partners',
          'root'      => 'Is root',
          'togglePartner' => 'Toggle',
          'toggleChild' => 'Toggle',
          'edit' => 'Edit',
          'remove' => 'Remove',
          'family'    => 'Family',
        );
        return $columns;
      }

      function usort_reorder($a, $b) {
        // If no sort, default to lastName
        $orderby = (!empty($_GET['orderby'])) ? $_GET['orderby'] : 'lastName';

        // If no order, default to asc
        $order = (!empty($_GET['order'])) ? $_GET['order'] : 'asc';

        // Determine sort order
        $result = strcmp($a[$orderby], $b[$orderby]);

        // Send final sort direction to usort
        return ($order === 'asc') ? $result : -$result;
      }

      function column_default($item, $column_name) {
        $id = $item['id'];
        switch ($column_name) {
          case 'id': return $item[$column_name];
          case 'firstName': return $item[$column_name];
          case 'surNames': return $item[$column_name];
          case 'lastName': return $item[$column_name];
          case 'birthName': return $item[$column_name];
          case 'birthday': return $item[$column_name];
          case 'deathday': return $item[$column_name];
          case 'children': return $item[$column_name];
          case 'partners': return $item[$column_name];
          case 'root': return '<input type="checkbox" ' . ( $item[$column_name] ? 'checked' : '' ) . ' onclick="window.pedigree.updateRoot(' . $id . ')" />';
          case 'togglePartner': return '<button type="button" onclick="window.pedigree.togglePartner('. $id . ')" class="button">as partner</button>';
          case 'toggleChild': return '<button type="button" onclick="window.pedigree.toggleChild('. $id . ')" class="button">as child</button>';
          case 'edit': return '<button type="button" onclick="window.pedigree.editPerson('. $id . ')" class="button icon"><span class="dashicons dashicons-edit"></span></button>';
          case 'remove': return '<button type="button" onclick="window.pedigree.removePerson('. $id . ')" class="button icon"><span class="dashicons dashicons-trash"></span></button>';
          case 'family': return $item[$column_name];
          default:
            return print_r($item, true); //Show the whole array for troubleshooting purposes
            }
      }

      function get_sortable_columns() {
        $sortable_columns = array(
          'firstName'  => array('firstName', true),
          'lastName' => array('lastName', true),
          'birthName'   => array('birthName', true),
        );
        return $sortable_columns;
      }
    
      // Bind table with columns, data and all
      function prepare_items() {
        if (isset($_POST['page']) && isset($_POST['s'])) {
          $this->persons_data = $this->get_persons_data($_POST['s']);
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
        $persons = pedigree_database_get_persons_new($search);
        return $persons;
      }      //...
}