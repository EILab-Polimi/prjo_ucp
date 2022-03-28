<?php

namespace Drupal\prjo_ucp\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Component\Render\FormattableMarkup;

/**
 * An example controller.
 */
class DashboardController extends ControllerBase {

  /**
   * Returns a render-able array for a test page.
   */
  public function dashboard() {

    $uid = \Drupal::currentUser()->id();
    $username = \Drupal::currentUser()->getDisplayName();
    // Count the entities inside the platform to display statistics in dashboard
    $cards = [];
    $ort_nids = []; // offer request technologies nids
    foreach (['water_offer', 'water_request', 'technology_product'] as $key => $value) {
      $qall = \Drupal::entityQuery('node')
        ->condition('status', NODE_PUBLISHED)
        ->condition('type', $value);
      $resall = $qall->execute();

      $qme = \Drupal::entityQuery('node')
        ->condition('status', NODE_PUBLISHED)
        ->condition('type', $value)
        ->condition('uid', $uid);
      $resme = $qme->execute();

      // kint(count($results));
      $cards[$value] = ['all' => count($resall), 'mine' => count($resme)];
      $ort_nids[$value] = ['all' => $resall];
    }


    // Get the water loops the authenticated user is involved
    // https://www.drupaleasy.com/blogs/ultimike/2020/07/entityquery-examples-everybody
    // https://api.drupal.org/api/drupal/core%21lib%21Drupal%21Core%21Entity%21Query%21QueryInterface.php/function/QueryInterface%3A%3AorConditionGroup/8.2.x
    // TODO maybe insert a dinstinct in the query
    // $uid = \Drupal::currentUser()->id();
    $query = \Drupal::entityQuery('node')
      ->condition('status', NODE_PUBLISHED)
      ->condition('type', 'water_loop');

    $group = $query
      ->orConditionGroup()
      ->condition('field_ws_ref.entity:node.uid', $uid)
      ->condition('field_wr_ref.entity:node.uid', $uid)
      ->condition('field_tp_ref.entity:node.uid', $uid);

    $wl_nids = $query
      ->condition($group)
      ->execute();

    // print_r($wl_nids);

    $nodes =  \Drupal\node\Entity\Node::loadMultiple($wl_nids);

    foreach ($nodes as $key => $node) {
      $rows[] = [
        // 'data' => $value,
        // https://drupal.stackexchange.com/questions/234218/how-to-theme-table-row-to-link-particular-column-data
        'data' => [new FormattableMarkup('<a href=":link">@name</a>', [':link' => '/node/'.$node->id(), '@name' => $node->getTitle()]),
                   $node->getOwner()->getUsername()  ],
        'class' => ['views-field', 'views-field-title'],
      ];
    }

    // kint($cards);
    // kint($nids);
    /**
    Water Streams
    **/
    $wo_geojson = prjo_ucp_waterloop_view_custom_geojson('water_offer', array_values($ort_nids['water_offer']['all']));

    // kint($wo_geojson);
    /**
    Water Demands
    **/
    $wr_geojson = prjo_ucp_waterloop_view_custom_geojson('water_request', array_values($ort_nids['water_request']['all']));


    $build = [
      '#theme' => 'dashboard',
      '#username' => $username,
      '#cards' => $cards,
      '#wl' => ['#theme' => 'table',
        '#attributes'=> ['id' => 'wltable', 'class' => ['table', 'table-striped', 'cols-0']],
        '#header' => array(t('Title'), t('Created by')),
        '#rows' => $rows
        ],
      '#attached' => [
        'library' => ["prjo_ucp/leaflet",
                      "prjo_ucp/leafletMarkerCluster",
                      "prjo_ucp/waterViewMap"
        ],
        'drupalSettings' => [
          'mapElements' => ["WS" => $wo_geojson, "WR" => $wr_geojson]
        ]
      ],
    ];
    return $build;

  }

}


function prjo_ucp_waterloop_view_custom_geojson($type, $nids) {
  // kint($nids);
  // Query all the water streams/water offers
  $entity = \Drupal::entityTypeManager()->getStorage('node');
  $query = $entity->getQuery();

  // $users = [2,5,17,22];
  // $query->condition('uid', $users, 'IN');

  $query_water = $query->condition('status', 1)
   ->condition('type', $type) #type = bundle id (machine name)
   ->condition('nid', $nids, 'IN')
   #->pager(15) #limit 15 items
   ->execute();

  // Load multiples or single item load($id)
  $water_nodes = $entity->loadMultiple($query_water);
  // dpm($ws);

  $geojson = [
    "type" => "FeatureCollection",
    "features" => [],
  ];
  foreach ($water_nodes as $key => $node) {
    $uid = $node->getOwnerID();
    $userName = $node->getOwner()->getUsername();
    // Get user/group picture url to add to the lefalet icon
    // NOTE See branch wl-map commit 9ee638cd

    // Add the feature only if the position is settled
    if(isset($node->get('field_water_stream_position')->value)){
      // kint($node);
      // set true false values for ismine
      // $ismine = ($current_user->id() == $uid) ? "true" : "false";
      // get coordinates values
      list($type, $blat, $blng) = explode(' ', $node->get('field_water_stream_position')->value);
      $feature = [
                "type" => "Feature",
                "geometry" => [
                  "type" => ucwords(strtolower($type)),
                  "coordinates" => [floatval(trim($blat,'()')), floatval(trim($blng,'()'))]
                ],
                "properties" => [
                  "nid" => $node->id(),
                  "title" => $node->get('title')->value,
                  "author" => $userName,
                  "uid" => $uid,
                  "application_field" => $node->get('field_application_field_txn')->target_id,
                  "flow" => $node->get('field_wr_flow')->value, // The flow is considered m3/day
                  // "ismine" => $ismine,
                  "selected" => "false"
                ]
              ];
      array_push($geojson['features'], $feature);

    }
  }

  return $geojson;
}
