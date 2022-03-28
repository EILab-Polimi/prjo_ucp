<?php

/**
 * @file
 * The module file.
 */

/**
 * Implements hook_views_data().
 */
// function prjo_ucp_views_data() {
//   $data['views']['table']['group'] = t('Custom Global');
//   $data['views']['table']['join'] = [
//     // #global is a special flag which allows a table to appear all the time.
//     '#global' => [],
//   ];
//
//   $data['views']['phase_views_field'] = [
//     'title' => t('Phase'),
//     'help' => t('The Phase which the current project is in.'),
//     // 'field' => [
//     //   'id' => 'phase_views_field',
//     // ],
//   ];
//   return $data;
// }


/**
 * Implements hook_views_data_alter().
 */
function prjo_ucp_views_data_alter(array &$data) {
  $data['node']['node_type_flagger'] = array(
    'title' => t('Node type flagger'),
    'field' => array(
      'title' => t('Node type flagger'),
      'help' => t('Flags a specific node type.'),
      'id' => 'node_type_flagger',
    ),
  );
}
