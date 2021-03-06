<?php

/**
 * @file
 * Definition of Drupal\prjo_ucp_waterloop\Plugin\views\field\CheckboxNotificationsFlagger
 */

namespace Drupal\prjo_ucp_waterloop\Plugin\views\field;

use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\NodeType;
use Drupal\views\Plugin\views\field\FieldPluginBase;
use Drupal\views\ResultRow;

/**
 * Field handler to flag the node type.
 *
 * @ingroup views_field_handlers
 *
 * @ViewsField("checkbox_notifications_flagger")
 */
class CheckboxNotificationsFlagger extends FieldPluginBase {

  /**
   * @{inheritdoc}
   */
  public function query() {
    // Leave empty to avoid a query on this field.
  }

  /**
   * Define the available options
   * @return array
   */
  protected function defineOptions() {
    $options = parent::defineOptions();
    // $options['node_type'] = array('default' => 'article');

    return $options;
  }

  /**
   * Provide the options form.
   */
  public function buildOptionsForm(&$form, FormStateInterface $form_state) {
    // $types = NodeType::loadMultiple();
    // $options = [];
    // foreach ($types as $key => $type) {
    //   $options[$key] = $type->label();
    // }
    // $form['node_type'] = array(
    //   '#title' => $this->t('Which node type should be flagged?'),
    //   '#type' => 'select',
    //   '#default_value' => $this->options['node_type'],
    //   '#options' => $options,
    // );

    parent::buildOptionsForm($form, $form_state);
  }

  /**
   * @{inheritdoc}
   */
  public function render(ResultRow $values) {
    $form['checkbox'] = [
      '#type' => 'checkbox',
      '#attributes' => array("checked" => FALSE, 'class' => array("prjo_notifications"))
    ];
    return $form;
  }
}
