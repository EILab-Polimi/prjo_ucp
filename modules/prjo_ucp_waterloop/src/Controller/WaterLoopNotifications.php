<?php

namespace Drupal\prjo_ucp_waterloop\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;

/**
 * An example controller.
 */
class WaterLoopNotifications extends ControllerBase {

  /**
   * Returns a render-able array for a test page.
   */
  public function getTerms() {
    // Load taxonomy to map ids for Application field
    $vid = 'water_application_field';
    $terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadTree($vid);
    // $terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadTree($vid, 0, NULL, TRUE);
    // drupal_set_message(print_r($terms,TRUE));
    $app_fields = [];
    foreach ($terms as $term) {
      $term_obj = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($term->tid);

      $app_fields[] = [
        'tid' => $term->tid,
        'name' => $term->name,
        'color' => $term_obj->get('field_map_legend_color')->color,
      ];
    }
    // drupal_set_message("<pre>".print_r($app_fields,TRUE)."</pre>");
    // return new JsonResponse($terms);
    return new JsonResponse($app_fields);
  }


  /**
  * The analysis are attached only to Water Streams
  */
  public function getWSAnalysis(Request $request) {
    $json_string = \Drupal::request()->getContent();
    $decoded = \Drupal\Component\Serialization\Json::decode($json_string);
    // print($decoded);
    // drupal_set_message("<pre>".print_r($json_string,TRUE)."</pre>");
    // drupal_set_message("<pre>".print_r($decoded,TRUE)."</pre>");

    $nids = [];
    foreach ($decoded['ws'] as $key => $value) {
      $nids[] = $value['nid'];
    }

    $entity = \Drupal::entityTypeManager()->getStorage('node');
    // $ws_nodes = $entity->loadMultiple($decoded['ws']);
    $ws_nodes = $entity->loadMultiple($nids);
    //
    foreach ($ws_nodes as $key => $node) {
      // drupal_set_message("<pre>".print_r($node,TRUE)."</pre>");
      $analysis = $node->get('field_analysis_values')->value;
      // drupal_set_message("<pre>".print_r($analysis,TRUE)."</pre>");
    }

    return new JsonResponse($analysis);
  }

  public function getAnalysisSpec(Request $request) {
    $json_string = \Drupal::request()->getContent();
    $decoded = \Drupal\Component\Serialization\Json::decode($json_string);
    // print($decoded);
    // drupal_set_message("Spec ".print_r($json_string,TRUE));
    // drupal_set_message("Spec ".print_r($decoded,TRUE));

    $query = \Drupal::entityQuery('node');
    $query->condition('type', 'analysis_specification');
    $query->condition('field_application_field_txn', $decoded['app_field'], '=');
    $result = $query->execute();
    foreach ($result as $key => $nid) {
      // drupal_set_message("<pre>".print_r($node,TRUE)."</pre>");
      $node = \Drupal::entityManager()->getStorage('node')->load($nid);
      $spec = $node->get('field_analysis_elements')->value;
      // drupal_set_message("<pre>".print_r($spec,TRUE)."</pre>");
    }

    // Nel caso si parta da una ws dobbiamo trovare le technologies che

    return new JsonResponse($spec);
  }


  // From the request we retrieve two separate lists of technologies nids
  // @return $tech_x_applf - will contains the technologies with the same application field
  // @return $tech_x_analysis - will contains the technologies related to the out of scale parameters
  // with the JSONB list of parameters the technology operate on

  public function getTechnologies(Request $request) {
    // drupal_set_message('getTechnologies');
    $json_string = \Drupal::request()->getContent();
    $decoded = \Drupal\Component\Serialization\Json::decode($json_string);

    // drupal_set_message(print_r($decoded,TRUE));
    // Query to get a list of thechnologies with same application field
    $query_app_field = \Drupal::entityQuery('node');
    $query_app_field->condition('type', 'technology_product');
    $query_app_field->condition('status', 1);
    $query_app_field->condition('field_application_field_txn', $decoded['app_field'], '=');
    $query_app_field->accessCheck(FALSE);
    $result_af = $query_app_field->execute();

    $tech_x_applf = [];
    foreach ($result_af as $key => $nid) {
      $node = \Drupal::entityManager()->getStorage('node')->load($nid);
      $tech_x_applf[$nid] = ["title" => $node->getTitle(), "author" => $node->getOwner()->getUsername()];
      // $tech_x_applf[] = $nid;
    }
    // drupal_set_message(print_r($tech_x_applf,TRUE));

    // Query the JSONB field of the technologies to get a list of technologies
    // that contains at least one 'out of range' parameter
    $database = \Drupal::database();
    $query = $database->select('node__field_technology_specifications', 'techspec');
    $query->fields('techspec', ['entity_id', 'field_technology_specifications_value']);
    //
    $orGroup = $query->orConditionGroup();
    foreach ($decoded['analysis'] as $key => $value) {
        $orGroup->condition('field_technology_specifications_value', "%" . $query->escapeLike('"observed property": "'.$value["op"].'"') . "%", 'LIKE');
    }

    $query->condition($orGroup);
    $result = $query->execute();

    // drupal_set_message(print_r(array_keys($result),TRUE));
    $tech_x_analysis = [];
    foreach ($result as $key => $value) {
      // drupal_set_message(print_r($key,TRUE));
      // drupal_set_message(print_r($value,TRUE));
      $node = \Drupal::entityManager()->getStorage('node')->load($value->entity_id);
      $tech_x_analysis[$value->entity_id] = ["title" => $node->getTitle(),
                                               "author" => $node->getOwner()->getUsername(),
                                               "spec" => $value->field_technology_specifications_value
                                               // TODO test per normalizzare con la call in visulizzazione
                                               // "spec" => $node->get('field_technology_specifications')->value
                                              ];

      // $tech_x_analysis[] = $value;
    }

    // Remove elements from $tech_x_applf if already in $tech_x_analysis
    foreach ($tech_x_analysis as $key => $value) {
      if (array_key_exists($key, $tech_x_applf)) {
          // echo "The 'first' element is in the array";
          unset($tech_x_applf[$key]);
      }
    }

    // drupal_set_message(print_r($tech_x_analysis,TRUE));
    $Json = ["techXanalysis" => $tech_x_analysis, "techXapplf" => $tech_x_applf];
    // drupal_set_message(print_r($Json,TRUE));
    return new JsonResponse($Json);
  }

  public function saveWL(Request $request) {
    $json_string = \Drupal::request()->getContent();
    $decoded = \Drupal\Component\Serialization\Json::decode($json_string);
    // print($decoded);
    $field_ws_ref = [];
    // $field_tp_ref = [];
    $field_wr_ref = [];
    foreach ($decoded['data'] as $key => $value) {
      if($key == "WS"){
        foreach ($value as $nid) {
          $field_ws_ref[] = [ 'target_id' => $nid ];
        }
      }
      // if ($key == "TP") {
      //   foreach ($value as $nid) {
      //     $field_tp_ref[] = [ 'target_id' => $nid ];
      //   }
      // }
      if ($key == "WR"){
        foreach ($value as $nid) {
          $field_wr_ref[] = [ 'target_id' => $nid ];
        }
      }
    }

    // \Drupal::logger('Water Loop')->notice('node %title.',
    // array(
    //     '%title' => $decoded['data']['TP'],
    // ));


    if($decoded['update'] != 'null') {
      $node = Node::load($decoded['update']);

      if ($node instanceof \Drupal\node\NodeInterface) {
        try {
          $node->set('title', $decoded['title']);
          $node->set('field_ws_ref', $field_ws_ref);
          // $node->set('field_tp_ref', $field_tp_ref);
          $node->set('field_tech_and_quantity', \Drupal\Component\Serialization\Json::encode($decoded['data']['TP']));
          $node->set('field_wr_ref', $field_wr_ref);
          $node->save();

          \Drupal::logger('Water Loop')->notice('node after %title.',
          array(
              '%title' => $node->title->value,
          ));

        }
        catch (\Exception $e) {
          // watchdog_exception('myerrorid', $e);
          \Drupal::logger('Water Loop')->error('@error: on node %title.',
          array(
              '@error' => $e,
              '%title' => $node->title(),
          ));
        }
      }

    } else {

      /**
      * add Node
      */
      $account = \Drupal::currentUser();
      try {
          $node = Node::create(['type' => 'water_loop']);
          $node->langcode = "en";
          $node->uid = $account->id();
          $node->promote = 0;
          $node->sticky = 0;
          $node->title= $decoded['title'];
          $node->field_ws_ref = $field_ws_ref;
          // $node->field_tp_ref = $field_tp_ref;
          $node->set('field_tech_and_quantity', \Drupal\Component\Serialization\Json::encode($decoded['data']['TP']));
          $node->field_wr_ref = $field_wr_ref;
          $node->save();
        }
      catch (\Exception $e) {
        \Drupal::logger('Water Loop')->error('@error.',
        array(
            '@error' => $e,
        ));
      }

    }
    // return new JsonResponse($decoded);
    // return new JsonResponse($decoded);
    return new JsonResponse($node->id());
    // return new JsonResponse("WS" => $field_ws_ref, "TP" => $field_tp_ref, "WR" => $field_wr_ref);
  }


}
