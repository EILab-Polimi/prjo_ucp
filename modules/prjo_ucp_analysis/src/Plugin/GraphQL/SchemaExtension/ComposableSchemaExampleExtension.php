<?php

namespace Drupal\prjo_ucp_analysis\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\GraphQL\Response\ResponseInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;
use Drupal\prjo_ucp_analysis\GraphQL\Response\UOMResponse;
// use Drupal\prjo_ucp_graphql_composable\GraphQL\Response\UserResponse;

/**
 * @SchemaExtension(
 *   id = "prjo_ucp_analysis_extension",
 *   name = "Composable Analysis extension ProjectO",
 *   description = "A simple extension that adds node related fields.",
 *   schema = "composable"
 * )
 */
class ComposableSchemaExampleExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry) {
    $builder = new ResolverBuilder();

    $registry->addFieldResolver('Query', 'units_of_measure',
      $builder->produce('entity_load')
        ->map('type', $builder->fromValue('node'))
        ->map('bundles', $builder->fromValue(['units_of_measure']))
        ->map('id', $builder->fromArgument('id'))
    );

    // Create article mutation.
    // $registry->addFieldResolver('Mutation', 'createWaterDemand',
    //   $builder->produce('create_water_request')
    //     ->map('data', $builder->fromArgument('data'))
    // );


    // Callback
    $registry->addFieldResolver('UOMResponse', 'units_of_measure',
      $builder->callback(function (UOMResponse $response) {
        return $response->units_of_measure();
      })
    );

    $registry->addFieldResolver('UOMResponse', 'errors',
      $builder->callback(function (UOMResponse $response) {
        return $response->getViolations();
      })
    );

    // Producers
    $registry->addFieldResolver('UOM', 'id',
      $builder->produce('entity_id')
        ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('UOM', 'title',
      $builder->compose(
        $builder->produce('entity_label')
          ->map('entity', $builder->fromParent())
      )
    );

    $registry->addFieldResolver('UOM', 'author',
      $builder->compose(
        $builder->produce('entity_owner')
          ->map('entity', $builder->fromParent()),
        $builder->produce('entity_label')
          ->map('entity', $builder->fromParent())
      )
    );

    $registry->addFieldResolver('UOM', 'jsonb',
        $builder->produce('property_path')
          ->map('type', $builder->fromValue('entity:node'))
          ->map('value', $builder->fromParent())
          ->map('path', $builder->fromValue('field_units_of_measure.value'))
    );


    // $registry->addFieldResolver('UserResponse', 'group',
    //   $builder->callback(function (userResponse $response) {
    //     return $response->user_request();
    //   })
    // );

    // Response type resolver.
    $registry->addTypeResolver('Response', [
      __CLASS__,
      'resolveResponse',
    ]);
  }

  /**
   * Resolves the response type.
   *
   * @param \Drupal\graphql\GraphQL\Response\ResponseInterface $response
   *   Response object.
   *
   * @return string
   *   Response type.
   *
   * @throws \Exception
   *   Invalid response type.
   */
  public static function resolveResponse(ResponseInterface $response): string {
    // Resolve content response.
    if ($response instanceof UOMResponse) {
      return 'UOMResponse';
    }
    // if ($response instanceof UserResponse) {
    //   return 'UserResponse';
    // }

    throw new \Exception('Invalid response type.');
  }

}
