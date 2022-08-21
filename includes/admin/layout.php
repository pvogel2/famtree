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

function pedigree_render_persons_listing($ps) {
  if ( $ps ) {
  ?>
  <table id="familyTable">
    <thead>
      <tr>
        <td>id</td>
        <td>family</td>
        <td>firstname</td>
        <td>surnames</td>
        <td>lastname</td>
        <td>birthname</td>
        <td>birthday</td>
        <td>deathday</td>
        <td>children</td>
        <td>partners</td>
        <td>root</td>
      </tr>
    </thead>
    <tbody>
      <?php
      foreach ( $ps as $p ) {
      ?>
      <tr>
        <td><?php print ($p->id) ?></td>
        <td><?php print ($p->family) ?></td>
        <td><?php print ($p->firstName) ?></td>
        <td><?php print ($p->surNames) ?></td>
        <td><?php print ($p->lastName) ?></td>
        <td><?php print ($p->birthName) ?></td>
        <td><?php print ($p->birthday) ?></td>
        <td><?php print ($p->deathday) ?></td>
        <td><?php print ($p->children) ?></td>
        <td><?php print ($p->partners) ?></td>
        <td><input type="checkbox" <?php $p->root ? print('checked') : '' ?> onclick="window.pedigree.updateRoot(<?php print ($p->id) ?>)" /></td>
        <td><button type="button" onclick="window.pedigree.togglePartner(<?php print ($p->id) ?>)" class="button">toggle as partner</button></td>
        <td><button type="button" onclick="window.pedigree.toggleChild(<?php print ($p->id) ?>)" class="button">toggle as child</button></td>
        <td><button type="button" onclick="window.pedigree.editPerson(<?php print ($p->id) ?>)" class="button">edit</button></td>
        <td><button type="button" onclick="window.pedigree.removePerson(<?php print ($p->id) ?>)" class="button">remove</button></td>
      </tr>
      <?php
      }
      ?>
    </tbody>
  </table>
  <?php
  } else {
  ?>
  <p>No persons found</p>
  <?php
  }
}

function pedigree_render_edit_person_form($families) {
  ?>
  <form method="post" action="?page=pedigree" id="editPersonForm">
    <input readonly hidden type="text" name="id" id="personId" /><br/>
    <table>
  <tr>
    <td><label for="family">Family:</label></td>
    <td>
      <select name="family" id="family">
        <?php foreach ($families as $family) { ?>
        <option value="<?php print($family) ?>"><?php print($family) ?></option>
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
      <button type="button" onclick="window.pedigree.removeFamily('<?php echo $family ?>')" class="button">remove</button>
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
