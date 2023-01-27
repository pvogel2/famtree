<?php

function famtree_form_read_field($name, $label) {
  ?>
  <tr>
    <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
    <td><input readonly type="text" name="<?php print ($name) ?>" id="<?php print ($name) ?>" /></td>
  </tr>  
  <?php
}

function famtree_form_text_field($name, $label) {
  ?>
  <tr>
    <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
    <td><input type="text" name="<?php print ($name) ?>" id="<?php print ($name) ?>" /></td>
  </tr>  
  <?php
}

function famtree_form_date_field($name, $label, $callback = NULL, $disabled = NULL) {
  ?>
  <tr>
    <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
    <td><input type="date" name="<?php print ($name) ?>" <?php if(isset($callback)) print('onchange="window.famtree.' . $callback . '()"') ?> min="1700-01-01" id="<?php print ($name) ?>" <?php if(isset($disabled)) print('disabled="disabled"') ?> /></td>
  </tr>
  <?php
}

function famtree_form_select_field($name, $label, $callback = NULL, $options = NULL, $rmCb = NULL) {
  ?>
  <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
  <td><div class="famtree-form__flex">
    <select autocomplete name="<?php print ($name) ?>" <?php if(isset($callback)) print('onchange="window.famtree.' . $callback . '()"') ?> id="<?php print ($name) ?>" class="famtree-form__data" disabled="disabled">
    <?php
      if(isset($options)) {
        foreach ($options as $option) {
          ?><option value="<?php print ($option) ?>"><?php echo __($option, 'famtree') ?></option><?php
        }
      }
    ?>
    </select>
    <?php if(isset($rmCb)) {
      render_remove_button($rmCb, $name);
    } ?>
  </div></td>
  <?php
}

function famtree_render_page_title($title) {
  ?>
  <h1><?php print(esc_html($title)) ?></h1>
  <?php
}

function famtree_render_section_title($title) {
  ?>
  <h2><?php print(esc_html($title)) ?></h2>
  <?php
}

function famtree_render_legend($text) {
  ?>
  <legend><h4><?php print(esc_html($text)) ?></h4></legend>
  <?php
}

function render_remove_button($callback, $prefix) {
  ?>
  <button disabled="disabled" type="button" onclick="window.famtree.<?php echo $callback ?>()" class="button icon" <?php if(isset($prefix)) print('name="' . $prefix . '_remove"') ?>>
    <span title="<?php echo __('remove', 'famtree') ?>" class="dashicons dashicons-trash"></span>
  </button>
  <?php
}

function famtree_render_persons_listing() {

  // Creating an instance
  $personsTable = new Persons_List_Table();

  echo '<div class="wrap">';
  // Prepare table
  $personsTable->prepare_items();

  ?>
  <form method="post">
    <input type="hidden" name="page" value="famtree" />
    <?php $personsTable->search_box('search', 'search_id'); ?>
  </form>
<?php

  // Display table
  $personsTable->display();
  echo '</div>';
}

function famtree_render_edit_person_form() {
  ?>
  <div style="display: flex;">
    <div>
    <form method="post" action="javascript:;" onsubmit="window.famtree.saveAll()" id="editPersonForm" class="form famtree-form">
      <input readonly hidden type="text" name="id" id="personId" />
      <div class="famtree-form__flex">
        <fieldset>
        <?php famtree_render_legend('Attributes') ?>
          <table>
            <?php
            famtree_form_text_field('firstName', 'First Name');
            famtree_form_text_field('surNames', 'Sur Names');
            famtree_form_text_field('lastName', 'Last Name');
            famtree_form_text_field('birthName', 'Birth Name');
            famtree_form_date_field('birthday', 'Birth day');
            famtree_form_date_field('deathday', 'Death day');
            ?>
          </table>
        </fieldset>
        <fieldset name="fs_relations" disabled="disabled">
        <?php famtree_render_legend('Relations') ?>
          <table>  
            <tr>
              <?php famtree_form_select_field('partners', 'Partners', 'partnerSelected', NULL, 'removePartner') ?>
            </tr>
            <tr>
              <?php famtree_form_select_field('children', 'Children', NULL, NULL, 'removeChild') ?>
            </tr>
            <?php
            famtree_form_date_field('relStart', 'Begin', 'relMetaChanged', TRUE);
            famtree_form_date_field('relEnd', 'End', 'relMetaChanged', TRUE);
            ?>
            <tr>
              <?php famtree_form_select_field('relType', 'Kind of', 'relMetaChanged', ['marriage', 'partnership']) ?>
            </tr>
            <tr>
              <td><br/></td>
            </tr>
            <tr>
              <?php famtree_form_select_field('candidates', 'add Person') ?>
            </tr>
            <tr>
              <td>
              </td>
              <td>
                <button type="button" name="btn_addChild" disabled="disabled" onclick="window.famtree.addChild()" class="button famtree-form__button"><?php echo __('as child', 'famtree') ?></button>
                <button type="button" onclick="window.famtree.addPartner()" class="button famtree-form__button"><?php echo __('as partner', 'famtree') ?></button>
              </td>
            </tr>
           </table>
        </fieldset>
        <fieldset name="fs_portrait" disabled="disabled">
          <input hidden id="portraitImageId" type="text" name="portraitImageId" class="form"/>
          <?php famtree_render_legend('Portrait foto') ?>
          <table>  
            <tr>
              <td>
                <?php printf(
                '<img src="%1$s" id="person-portrait" width="100" height="100" style="object-fit: cover"/>',
                  plugins_url( '../../admin/images/default.jpg', __FILE__ )
                );?>
              </td>
            </tr>
            <tr>
              <td>
                <input id="portrait-upload-button" type="button" class="button" value="Select Image" />
              </td>
            </tr>
          </table>
        </fieldset>
      </div>
      <fieldset class="submit" name="fs_buttons" disabled="disabled">
        <button type="button" onclick="window.famtree.resetPerson()" class="button famtree-form__button"><?php echo __('Reset Person', 'famtree') ?></button>
        <button type="button" onclick="window.famtree.deletePerson()" class="button famtree-form__button"><?php echo __('Remove Person', 'famtree') ?></button>
        <button id="person-submit"  type="submit" value="Submit" class="button button-primary famtree-form__button"><?php echo __('Save Person', 'famtree') ?></button>
      </fieldset>
      </form>
    </div>
    <div class="famtree-metadata-container">
      <?php famtree_render_legend('Additional files') ?>
      <div class="famtree-metadata-container__list">
        <table class="wp-list-table striped widefat toplevel_page_famtree">
          <thead>
            <th scope="col"><?php echo __('Preview', 'famtree') ?></th>
            <th scope="col"><?php echo __('Name', 'famtree') ?></th>
            <th scope="col"><?php echo __('Description', 'famtree') ?></th>
            <th scope="col"></th> 
            <th scope="col"></th> 
          </thead>
          <tbody  id="existingMetadata">
            <td colspan="5" class="column-nocontent"><?php echo __('no files found', 'famtree') ?></td>
          </tbody>
        </table>
      </div>
      <div>
        <form method="post" id="uploadMetadataForm" action="javascript:;" class="form famtree-form">
          <fieldset class="last" disabled="disabled" name="fs_add">
            <input hidden id="upload-metadata-refid" type="text" name="refid" />
            <table>
              <tr>
                <td>
                  <input id="upload-metadata-button" type="button" class="button" value="Add Metadata"/>
                </td>
              </tr>
            </table>
          </fieldset>
        </form>
      </div>
    </div>
  </div>
  <?php
}

function famtree_render_runtime_message() {
  ?>
    <div id="famtree-message" class="notice is-dismissible famtree-hidden">
      <p class="famtree-message__text"></p>
      <button type="button" class="notice-dismiss" onclick="window.famtree.hideMessage()">
        <span class="screen-reader-text">Dismiss this notice.</span>
      </button>
    </div>
  <?php
}

function famtree_render_success_feedback($message) {
  ?>
  <div class="notice notice-success is-dismissible">
      <p><?php echo $message; ?></p>
  </div>
  <?php
}

function famtree_render_error_feedback($message) {
  ?>
  <div class="notice notice-error is-dismissible">
      <p><?php print __('Error', 'famtree'); echo ': '; echo $message; ?></p>
  </div>
  <?php
}
