<?php

/**
 * Implements hook_views_data_alter().
 */
function prjo_ucp_waterloop_views_data_alter(array &$data) {
  $data['node']['checkbox_notifications_flagger'] = array(
    'title' => t('Checkbox Notifications Flagger'),
    'field' => array(
      'title' => t('Checkbox Notifications Flagger'),
      'help' => t('Simple checkbox for send notification to selected "entityes" in a Water Loop view.'),
      'id' => 'checkbox_notifications_flagger',
    ),
  );
}
