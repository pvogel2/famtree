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

function pedigree_form_date_field($name, $label, $callback = NULL) {
  ?>
  <tr>
    <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
    <td><input type="date" name="<?php print ($name) ?>" <?php if(isset($callback)) print('onchange="window.pedigree.' . $callback . '()"') ?> min="1700-01-01" id="<?php print ($name) ?>" /></td>
  </tr>
  <?php
}

function pedigree_form_select_field($name, $label, $callback = NULL) {
  ?>
  <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
  <td>
    <select name="<?php print ($name) ?>" <?php if(isset($callback)) print('onchange="window.pedigree.' . $callback . '()"') ?> id="<?php print ($name) ?>" class="ped-form__data" disabled="disabled">
    </select>
  </td>
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
    <td>
      <p class="submit">
        <button type="button" onclick="window.pedigree.resetPerson()" class="button ped-form__button">Reset Person</button>
      </p>
    </td>
    <td>
      <p class="submit">
        <button type="button" onclick="window.pedigree.deletePerson()" class="button ped-form__button">Remove Person</button>
        <button id="person-submit"  type="submit" value="Submit" class="button button-primary ped-form__button">Save Person</button>
    </p></td>
  </tr>
  <?php
}

function pedigree_render_page_title($title) {
  ?>
  <h1><?php print(esc_html($title)) ?></h1>
  <?php
}

function pedigree_render_section_title($title) {
  ?>
  <h2><?php print(esc_html($title)) ?></h2>
  <?php
}

function pedigree_render_legend($text) {
  ?>
  <legend><h4><?php print(esc_html($text)) ?></h4></legend>
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

function render_remove_button($callback, $param) { //removeFamily // $family
  ?>
  <button type="button" onclick="window.pedigree.<?php echo $callback ?>('<?php echo $param ?>')" class="button icon">
    <span title="<?php echo __('remove', 'pedigree') ?>" class="dashicons dashicons-trash"></span>
  </button>
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
  <div style="display: flex;">
    <div>
    <form method="post" action="javascript:;" onsubmit="window.pedigree.saveAll()" id="editPersonForm" class="form ped-form">
      <input readonly hidden type="text" name="id" id="personId" />
      <div class="ped-form__flex">
        <fieldset>
        <?php pedigree_render_legend('Attributes') ?>
          <table>
            <tr>
              <td><label for="family">Family:</label></td>
              <td>
                <select name="family" id="family" class="ped-form__data">
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
            ?>
          </table>
        </fieldset>
        <fieldset>
        <?php pedigree_render_legend('Relations') ?>
          <table>  
            <tr>
              <?php pedigree_form_select_field('partners', 'Partners', 'partnerSelected') ?>
              <td><?php render_remove_button('removePartner', '') ?></td>
            </tr>
            <tr>
              <?php pedigree_form_select_field('children', 'Children') ?>
              <td><?php render_remove_button('removeChild', '') ?></td>
            </tr>
            <?php
            pedigree_form_date_field('relStart', 'Begin', 'relMetaChanged');
            pedigree_form_date_field('relEnd', 'End', 'relMetaChanged');
            ?>
            <tr>
              <td><label for="relType"><?php echo __('Kind of:', 'pedigree') ?></label></td>
              <td>
                <select name="relType" id="relType" class="ped-form__data" onchange="window.pedigree.relMetaChanged()">
                  <option value="marriage"><?php echo __('marriage', 'pedigree') ?></option>
                  <option value="partnership"><?php echo __('partnership', 'pedigree') ?></option>
                </select>
              </td>
            </tr>
            <tr>
              <td><br/></td>
            </tr>
            <tr>
              <?php pedigree_form_select_field('candidates', 'add Person') ?>
            </tr>
            <tr>
              <td>
              </td>
              <td>
                <button type="button" onclick="window.pedigree.addChild()" class="button ped-form__button"><?php echo __('as child', 'pedigree') ?></button>
                <button type="button" onclick="window.pedigree.addPartner()" class="button ped-form__button"><?php echo __('as partner', 'pedigree') ?></button>
              </td>
            </tr>
           </table>
        </fieldset>
      </div>
      <p class="submit">
        <button type="button" onclick="window.pedigree.resetPerson()" class="button ped-form__button">Reset Person</button>
        <button type="button" onclick="window.pedigree.deletePerson()" class="button ped-form__button">Remove Person</button>
        <button id="person-submit"  type="submit" value="Submit" class="button button-primary ped-form__button">Save Person</button>
      </p>
      </form>
    </div>
    <div>
      <form method="post" id="uploadPortraitForm" class="form ped-form">
        <fieldset class="last">
          <input hidden id="upload-media-id" type="text" name="portrait-id" class="form"/>
          <input hidden id="upload-person-id" type="text" name="id" />
          <?php pedigree_render_legend('Visual aspects') ?>
          <table>  
            <tr>
              <td><label>Portrait:</label></td>
              <td>
                <?php printf(
                '<img src="%1$s" id="person-portrait" width="100" height="100" style="object-fit: cover"/>',
                  plugins_url( '../../admin/images/default.jpg', __FILE__ )
                );?>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
              <input id="upload-button" type="button" class="button" value="Select Image" />
              <input id="upload-submit"  type="submit" disabled value="Submit" class="button button-primary"/>
              </td>
            </tr>
          </table>
        </fieldset>
      </form>
    </div>
  </div>
  <?php
}

function pedigree_render_families_fieldsets($families) {
  ?>
  <fieldset>
    <label>
      <input type="text" id="pedigreeFamiliesInput" placeholder="<?php echo __('new family', 'pedigree') ?>" value="" />
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
