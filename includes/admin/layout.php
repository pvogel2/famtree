<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function famtree_form_read_field($name, $label) {
  ?>
  <tr>
    <td><label for="<?php print esc_html($name) ?>"><?php print esc_html($label) ?>:</label></td>
    <td><input readonly type="text" name="<?php print esc_html($name) ?>" id="<?php print esc_html($name) ?>" /></td>
  </tr>  
  <?php
}

function famtree_form_text_field($name, $label) {
  ?>
  <tr>
    <td><label for="<?php print esc_html($name) ?>"><?php print esc_html($label) ?>:</label></td>
    <td><input type="text" name="<?php print esc_html($name) ?>" id="<?php print esc_html($name) ?>" /></td>
  </tr>  
  <?php
}

function famtree_form_date_field($name, $label, $callback = NULL, $disabled = NULL) {
  ?>
  <tr>
    <td><label for="<?php print esc_html($name) ?>"><?php print esc_html($label) ?>:</label></td>
    <td><input type="date" name="<?php print esc_html($name) ?>" <?php if(isset($callback)) print('onchange="window.famtree.' . esc_html($callback) . '()"') ?> min="1700-01-01" id="<?php print esc_html($name) ?>" <?php if(isset($disabled)) print('disabled="disabled"') ?> /></td>
  </tr>
  <?php
}

function famtree_form_select_field($name, $label, $callback = NULL, $options = NULL, $rmCb = NULL) {
  ?>
  <td><label for="<?php print esc_html($name) ?>"><?php print esc_html($label) ?>:</label></td>
  <td><div class="famtree-form__flex">
    <select autocomplete name="<?php print esc_html($name) ?>" <?php if(isset($callback)) print('onchange="window.famtree.' . esc_html($callback) . '()"') ?> id="<?php print esc_html($name) ?>" class="famtree-form__data" disabled="disabled">
    <?php
      if(isset($options)) {
        foreach ($options as $option) {
          ?><option value="<?php print esc_html($option['value']) ?>"><?php print esc_html($option['title']) ?></option><?php
        }
      }
    ?>
    </select>
    <?php if(isset($rmCb)) {
      famtree_render_remove_button($rmCb, $name);
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

function famtree_render_remove_button($callback, $prefix) {
  ?>
  <button disabled="disabled" type="button" onclick="window.famtree.<?php echo esc_html($callback) ?>()" class="button icon" <?php if(isset($prefix)) print('name="' . esc_html($prefix) . '_remove"') ?>>
    <span title="<?php echo esc_html_e('remove', 'famtree') ?>" class="dashicons dashicons-trash"></span>
  </button>
  <?php
}

function famtree_render_persons_listing() {

  // Creating an instance
  $personsTable = new Famtree_Persons_List_Table();

  echo '<div class="wrap">';
  wp_nonce_field('update-root-nonce', 'update-root-nonce');
  // Prepare table
  $personsTable->prepare_items();

  ?>
  <form method="post">
    <?php
      wp_nonce_field('search-person-nonce', 'search-person-nonce');
    ?>
    <input type="hidden" name="page" value="famtree" />
    <?php $personsTable->search_box('search', 'search_id'); ?>
  </form>
<?php

  // Display table
  echo '<div id="persons_table_container">';
  $personsTable->display();
  echo '</div></div>';
}

function famtree_render_public_access() {
  $public_access = get_option('famtree_public_access');
  ?>
  <input name="famtree_public_access" type="checkbox" id="famtree_public_access" <?php ($public_access ? print('checked') : '') ?> >
  <label for="famtree_public_access"><?php echo esc_html_e( 'On the published page the data of the family trees can be read without login. Usefull for trees that should be visible to the public.', 'famtree' ); ?></label>
  <?php
}

function famtree_render_global_settings() {
  // currently nothing to render
}

function famtree_render_edit_person_form() {
  ?>
  <div style="display: flex;">
    <div>
    <form method="post" action="javascript:;" onsubmit="window.famtree.saveAll()" id="editPersonForm" class="form famtree-form">
      <?php
        wp_nonce_field('edit-person-nonce', 'edit-person-nonce');
      ?>
      <input readonly hidden type="text" name="id" id="personId" />
      <div class="famtree-form__flex">
        <fieldset>
        <?php famtree_render_legend(__('Attributes', 'famtree')) ?>
          <table>
            <?php
            famtree_form_text_field('firstName', __('First name', 'famtree'));
            famtree_form_text_field('surNames', __('Sur names', 'famtree'));
            famtree_form_text_field('lastName', __('Last name', 'famtree'));
            famtree_form_text_field('birthName', __('Birth name', 'famtree'));
            famtree_form_date_field('birthday', __('Birthday', 'famtree'));
            famtree_form_date_field('deathday', __('Date of death', 'famtree'));
            ?>
          </table>
        </fieldset>
        <fieldset name="fs_relations" disabled="disabled">
        <?php famtree_render_legend(__('Relations', 'famtree')) ?>
          <table>  
            <tr>
              <?php famtree_form_select_field('partners', __('Partners', 'famtree'), 'partnerSelected', NULL, 'removePartner') ?>
            </tr>
            <tr>
              <?php famtree_form_select_field('children', __('Children', 'famtree'), NULL, NULL, 'removeChild') ?>
            </tr>
            <?php
            famtree_form_date_field('relStart', __('Begin', 'famtree'), 'relationModified', TRUE);
            famtree_form_date_field('relEnd', __('End', 'famtree'), 'relationModified', TRUE);
            ?>
            <tr>
              <?php
                $options = [
                  array('value' => 'marriage', 'title' => __('marriage', 'famtree')),
                  array('value' => 'partnership', 'title' => __('partnership', 'famtree')),
                ];
                famtree_form_select_field('relType', __('Kind of', 'famtree'), 'relationModified', $options);  
              ?>
            </tr>
            <tr>
              <td><br/></td>
            </tr>
            <tr>
              <?php famtree_form_select_field('candidates', __('Add person', 'famtree')) ?>
            </tr>
            <tr>
              <td>
              </td>
              <td>
                <button type="button" name="btn_addChild" disabled="disabled" onclick="window.famtree.addChild()" class="button famtree-form__button">
                  <?php echo esc_html_e('As child', 'famtree') ?>
                </button>
                <button type="button" name="btn_addPartner" onclick="window.famtree.addPartner()" class="button famtree-form__button">
                  <?php echo esc_html_e('As partner', 'famtree') ?>
                </button>
              </td>
            </tr>
           </table>
        </fieldset>
        <fieldset name="fs_portrait" disabled="disabled">
          <input hidden id="portraitId" type="text" name="portraitId" class="form"/>
          <?php famtree_render_legend(__('Portrait foto', 'famtree')) ?>
          <table>  
            <tr>
              <td>
                <?php printf(
                  '<img src="%1$s" id="person-portrait" width="100" height="100" style="object-fit: cover"/>',
                  esc_html(plugins_url( '../../admin/images/default.jpg', __FILE__ ))
                );?>
              </td>
            </tr>
            <tr>
              <td>
                <input id="portrait-upload-button" type="button" class="button" value="<?php echo esc_html_e('Select image', 'famtree') ?>" />
              </td>
            </tr>
          </table>
        </fieldset>
      </div>
      <fieldset class="submit" name="fs_buttons" disabled="disabled">
        <button type="button" onclick="window.famtree.resetPerson()" class="button famtree-form__button"><?php echo esc_html_e('Reset person', 'famtree') ?></button>
        <button type="button" onclick="window.famtree.deletePerson()" class="button famtree-form__button"><?php echo esc_html_e('Remove person', 'famtree') ?></button>
        <button id="person-submit"  type="submit" value="Submit" class="button button-primary famtree-form__button"><?php echo esc_html_e('Save person', 'famtree') ?></button>
      </fieldset>
    </form>
    </div>
    <div class="famtree-metadata-container">
      <?php famtree_render_legend(__('Additional files', 'famtree')) ?>
      <div class="famtree-metadata-container__list">
        <table class="wp-list-table striped widefat toplevel_page_famtree">
          <thead>
            <th scope="col"><?php echo esc_html_e('Preview', 'famtree') ?></th>
            <th scope="col"><?php echo esc_html_e('Name', 'famtree') ?></th>
            <th scope="col"><?php echo esc_html_e('Description', 'famtree') ?></th>
            <th scope="col"></th> 
            <th scope="col"></th> 
          </thead>
          <tbody  id="existingMetadata">
            <td colspan="5" class="column-nocontent"><?php echo esc_html_e('No files found', 'famtree') ?></td>
          </tbody>
        </table>
      </div>
      <div>
        <form method="post" id="uploadMetadataForm" action="javascript:;" class="form famtree-form">
          <?php
            wp_nonce_field('edit-metadata-nonce', 'edit-metadata-nonce');
          ?>
          <fieldset class="last" name="fs_add" disabled="disabled">
            <input hidden id="upload-metadata-refid" type="text" name="refid" />
            <table>
              <tr>
                <td>
                  <input id="upload-metadata-button"  type="button" class="button" value="<?php echo esc_html_e('Add metadata', 'famtree') ?>"/>
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
      <button type="button" class="notice-dismiss" onclick="window.famtree.message.hide()">
        <span class="screen-reader-text"><?php print esc_html_e('Dismiss this notice.', 'famtree') ?></span>
      </button>
    </div>
  <?php
}

function famtree_render_success_feedback($message) {
  ?>
  <div class="notice notice-success is-dismissible">
      <p><?php echo esc_html($message); ?></p>
  </div>
  <?php
}

function famtree_render_error_feedback($message) {
  ?>
  <div class="notice notice-error is-dismissible">
      <p><?php print esc_html_e('Error', 'famtree'); echo ': '; echoesc_html($message); ?></p>
  </div>
  <?php
}
