<?php

function pedigree_form_read_field($name, $label) {
  ?>
  <tr>
    <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
    <td><input readonly type="text" name="<?php print ($name) ?>" id="<?php print ($name) ?>" /></td>
  </tr>  
  <?php
}

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

function pedigree_render_page_title($title) {
  ?>
  <h1><?php echo esc_html($title) ?></h1>
  <?php
}

function pedigree_render_section_title($title) {
  ?>
  <h2><?php echo esc_html($title) ?></h2>
  <?php
}

function pedigree_render_delete_person_form() {
  ?>
  <form method="post" action="?page=pedigree" id="deletePersonForm">
    <input type="text" hidden name="deleteId" id="deletePersonId" />
  </form>
  <?php
}

function pedigree_render_update_root_form() {
  ?>
  <form method="post" action="?page=pedigree" id="updateRootForm">
    <input type="text" hidden name="rootId" id="rootId" />
    <input type="text" hidden name="rootValue" />
  </form>
  <?php
}

function pedigree_render_persons_listing() {

  // Creating an instance
  $personsTable = new Persons_List_Table();

  echo '<div class="wrap">';
  // Prepare table
  $personsTable->prepare_items();

  ?>
  <form method="post">
        <input type="hidden" name="page" value="pedigree" />
        <?php $personsTable->search_box('search', 'search_id'); ?>
  </form>
<?php

  // Display table
  $personsTable->display();
  echo '</div>';
}

function pedigree_render_edit_person_form($families, $preselect) {
  ?>
  <form method="post" action="?page=pedigree" id="editPersonForm">
    <input readonly hidden type="text" name="id" id="personId" /><br/>
    <table>
  <tr>
    <td><label for="family">Family:</label></td>
    <td>
      <select name="family" id="family">
        <?php foreach ($families as $family) { ?>
        <option value="<?php print($family) ?>" <?php if ($family == $preselect) print('selected="selected"') ?> ><?php print($family) ?></option>
        <?php } ?>
      </select>
    </td>
  </tr>  
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
<?php
}

function pedigree_render_families_fieldsets($families) {
  ?>
  <fieldset>
    <label>
      <input type="text" id="pedigreeFamiliesInput" placeholder="<?php echo __('new family', 'pedigree') ?>"value="" />
      <button class="button" type="button" onclick="window.pedigree.addFamily()">add</button>
      <br>
    </label>
  </fieldset>
  <fieldset>
    <label></label>
  </fieldset>
  <fieldset id="pedigreeKnownFamilies">
    <?php foreach ($families as $family) { ?>
    <label id="pedigree_families_<?php echo $family ?>_container">
      <input type="text" readonly name="pedigree_families[<?php echo $family ?>]" value="<?php echo $family ?>" />
      <?php if ($family != 'default') { ?> 
      <button type="button" onclick="window.pedigree.removeFamily('<?php echo $family ?>')" class="button icon"><span title="<?php print('remove') ?>" class="dashicons dashicons-trash"></span></button>
      <?php } ?>
    </label>
    <br>
  <?php } ?>
  </fieldset>
  <?php
}

function pedigree_render_success_feedback($message) {
  ?>
  <div class="notice notice-success is-dismissible">
      <p><?php echo $message; ?></p>
  </div>
  <?php
}

function pedigree_render_error_feedback($message) {
  ?>
  <div class="notice notice-error is-dismissible">
      <p><?php print __('Error', 'pedigree'); echo ': '; echo $message; ?></p>
  </div>
  <?php
}
