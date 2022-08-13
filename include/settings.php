<?php
require_once(PEDIGREE__PLUGIN_DIR . 'include/database.php');

function pedigree_settings_init() {
    // Register a new setting for "pedigree" page.
    $args = array(
      'type' => 'array',
      'sanitize_callback' => 'sanitize_text_field',
      'default' => array(),
    );
    register_setting( 'pedigree-options', 'pedigree_families',  $args);
 
    // Register a new section in the "pedigree" page.
    add_settings_section(
      'pedigree-options',
      __( 'The Matrix has you.', 'pedigree' ), 'pedigree_section_options',
      'pedigree'
    );
 
    // Register a new field in the "pedigree_section_developers" section, inside the "pedigree" page.
    add_settings_field(
      'pedigree_field_families', // As of WP 4.6 this value is used only internally.
                               // Use $args' label_for to populate the id inside the callback.
      __( 'Pill', 'pedigree' ),
      'pedigree_field_families_cb',
      'pedigree',
      'pedigree-options',
      array(
       'label_for'         => 'pedigree_field_families',
       'class'             => 'pedigree_row',
       'pedigree_custom_data' => 'custom',
      )
    );
}

function pedigree_field_families_cb() {
  $families = get_option( 'pedigree_families', [] );
	$args = isset( $families ) ? (array) $families : [];	
	?>
	<input type="text" name="pedigree_families[]" value="['test1', 'test2']" />
	<select id="pedigree_families_select" name="pedigree_families[]">
		<option <?php selected( in_array( 'ONE', $args ), 1 ); ?> value="ONE">One</option>
		<option <?php selected( in_array( 'TWO', $args ), 1 ); ?> value="TWO">Two</option>
	</select>
	<?php	
}

function pedigree_section_options() {
  print('Hello settings!');
}

/* Register settings script. */
function pedigree_admin_init() {
  wp_register_script( 'pedigree-admin-script', plugins_url('/admin/script.js', __FILE__) );
  pedigree_settings_init();
}

function pedigree_admin_scripts() {
  /*
   * It will be called only on your plugin admin page, enqueue our script here
   */
  wp_enqueue_script( 'pedigree-admin-script' );
}

/**
 * Add the top level menu page.
 */
function pedigree_options_page() {
  $page = add_menu_page(
    'Pedigree',
    'Pedigree Options',
    'pedigree_write',
    'pedigree',
    'pedigree_options_page_html'
  );
  add_action('admin_print_scripts-' . $page, 'pedigree_admin_scripts');
}

/**
 * Register our pedigree_options_page to the admin_menu action hook.
 */
add_action( 'admin_menu', 'pedigree_options_page' );


/**
 * Register javascript for the pedigree_options_page.
 */
add_action( 'admin_init', 'pedigree_admin_init' );

function pedigree_settings_capability($capability) {
  return 'pedigree_write';
}

add_filter( 'pedigree_capability_pedigree-options', 'pedigree_settings_capability' );

/**
 * Top level menu callback function
 */
function pedigree_options_page_html() {
  // check user capabilities
  if ( ! current_user_can( 'pedigree_write' ) ) {
    return;
  }

  if (
    !empty($_POST)
    && $_POST['firstName'] != ''
    && $_POST['lastName'] != ''
  ) {
      $personId = sanitize_text_field($_POST['id']);
      if (empty($personId)) {
        pedigree_database_create_person($_POST);
      } else {
        pedigree_database_update_person($_POST);
      }
    }

    // add error/update messages
 
    // check if the user have submitted the settings
    // WordPress will add the "settings-updated" $_GET parameter to the url
    if ( isset( $_GET['settings-updated'] ) ) {
      // add settings saved message with the class of "updated"
      add_settings_error( 'pedigree_messages', 'pedigree_message', __( 'Settings Saved', 'pedigree' ), 'updated' );
    }
 
    // show error/update messages
    settings_errors( 'pedigree_messages' );

    function pedigree_form_text_field($name, $label) {
      ?>
      <tr>
        <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
        <td><input type="text" name="<?php print ($name) ?>" id="<?php print ($name) ?>" /></td>
      </tr>  
      <?php
    }

    function pedigree_form_date_field($name, $label) {
      ?>
      <tr>
        <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
        <td><input type="date" name="<?php print ($name) ?>" min="1700-01-01" id="<?php print ($name) ?>" /></td>
      </tr>
      <?php
    }

    function pedigree_form_array_field($name, $label) {
      ?>
      <tr>
        <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
        <td><input readonly type="text" name="<?php print ($name) ?>" id="<?php print ($name) ?>" /></td>
    </tr>
      <?php
    }

    function pedigree_form_buttons() {
      ?>
      <tr>
        <td><p class="submit"><button type="button" onclick="window.pedigree.resetPerson()" class="button">Reset Person</button></p></td>
        <td><?php submit_button( 'Save Person' ) ?></td>
      </tr>
      <?php
    }
    ?>
    <div class="pedigree wrap">
      <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
      
      <form action="options.php" method="post">
        <?php
        // output security fields for the registered setting "wporg"
        settings_fields( 'pedigree-options' );
        // output setting sections and their fields
        // (sections are registered for "pedigree", each field is registered to a specific section)
        ?>
          <input name="pedigree_families[default]">
          <input name="pedigree_families[test]">
        <?php
        do_settings_sections( 'pedigree' );
        // output save settings button
        submit_button( 'Save Settings' );

        ?>
        </form>

        <form method="post" action="?page=pedigree" id="editPersonForm">
          <input readonly hidden type="text" name="id" id="personId" /><br/>
          <table>
          <?php 
            pedigree_form_text_field('firstName', 'First Name');
            pedigree_form_text_field('surNames', 'Sur Names');
            pedigree_form_text_field('lastName', 'Last Name');
            pedigree_form_text_field('birthName', 'Birth Name');

            pedigree_form_date_field('birthday', 'Birth day');
            pedigree_form_date_field('deathday', 'Death day');

            pedigree_form_array_field('children', 'Children');
            pedigree_form_array_field('partners', 'Partners');
            pedigree_form_buttons();
          ?>
          </table>
        </form>
      </div>
    <?php
      $results = pedigree_database_get_persons('test');

      if ( $results ) {
    ?>
      <table id="familyTable">
        <thead>
          <tr>
          <td>id</td>
          <td>firstname</td>
          <td>surnames</td>
          <td>lastname</td>
          <td>birthname</td>
          <td>birthday</td>
          <td>deathday</td>
          <td>children</td>
          <td>partners</td>
        </tr>
      </thead>
      <tbody>
    <?php
      foreach ( $results as $person ) {
    ?>
      <tr>
        <td><?php print ($person->id) ?></td>
        <td><?php print ($person->firstName) ?></td>
        <td><?php print ($person->surNames) ?></td>
        <td><?php print ($person->lastName) ?></td>
        <td><?php print ($person->birthName) ?></td>
        <td><?php print ($person->birthday) ?></td>
        <td><?php print ($person->deathday) ?></td>
        <td><?php print ($person->children) ?></td>
        <td><?php print ($person->partners) ?></td>
        <td><button onclick="window.pedigree.togglePartner(<?php print ($person->id) ?>)" class="button">toggle as partner</button></td>
        <td><button onclick="window.pedigree.toggleChild(<?php print ($person->id) ?>)" class="button">toggle as child</button></td>
        <td><button onclick="window.pedigree.editPerson(<?php print ($person->id) ?>)" class="button">edit</button></td>
      </tr>
    <?php
      }
    ?>
      </tbody></table>
    <?php
      } else {
    ?>
      <p>Not Found</p>
    <?php
      }
    }
